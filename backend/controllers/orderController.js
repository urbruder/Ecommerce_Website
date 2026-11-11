
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import Stripe from 'stripe'

// Global Variables
const currency='inr'
const deliveryCharge=10

// Gateway Initialised
const stripe=new Stripe(process.env.STRIPE_SECRET_KEY)

// Helper: derive firstName and lastName from MongoDB account name and enforce account identity
const getSanitizedAddress = async (userId, clientAddress = {}) => {
    const user = await userModel.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    const nameTokens = (user.name || '').trim().split(/\s+/).filter(Boolean);
    const firstName = nameTokens[0] || clientAddress.firstName || '';
    const lastName = nameTokens.slice(1).join(' ') || clientAddress.lastName || '';
    const email = user.email || clientAddress.email || '';

    return {
        ...clientAddress,
        firstName,
        lastName,
        email
    };
};

// Helper: compute total order amount securely from DB product prices + deliveryCharge
const calculateOrderAmount = async (items) => {
    let subtotal = 0;
    for (const item of items) {
        const product = await productModel.findById(item._id);
        if (!product) {
            throw new Error(`Product not found: ${item.name || item._id}`);
        }
        subtotal += product.price * item.quantity;
    }
    return subtotal + deliveryCharge;
};


// Placing order using COD method
 const placeOrder=async(req,res)=>{
try {
    const {userId,items,amount}=req.body;
    const address = await getSanitizedAddress(userId, req.body.address);
    const orderData={
        userId,
        items,
        address,
        amount,
        paymentMethod:"COD",
        payment:false,
        date:Date.now()
    }

     const newOrder=new orderModel(orderData);
     await newOrder.save();

     await userModel.findByIdAndUpdate(userId,{cartData:{}});

     res.json({success:true,message:"Order Placed"});

} catch (error) {
    console.error("placeOrder error:", error.message);
    res.json({success:false,message:error.message});
}
}

// Placing order using Stripe method
 const placeOrderStripe=async(req,res)=>{
    try {
        
        const {userId,items,amount}=req.body;
        const {origin}=req.headers;
        const address = await getSanitizedAddress(userId, req.body.address);

        const orderData={
        userId,
        items,
        address,
        amount,
        paymentMethod:"Stripe",
        payment:false,
        date:Date.now()
       }
     const newOrder=new orderModel(orderData);
     await newOrder.save();

     const line_items=items.map((item)=>({
        price_data:{
            currency:currency,
            product_data:{
                name:item.name
            },
            unit_amount:item.price*100
        },
        quantity:item.quantity
     }))

     line_items.push({
        price_data:{
            currency:currency,
            product_data:{
                name:'Delivery Charges'
            },
            unit_amount:deliveryCharge*100
        },
        quantity:1        
     })

     const session=await stripe.checkout.sessions.create({
        success_url:`${origin}/verify?success=true&orderId=${newOrder._id}`,
        cancel_url:`${origin}/verify?success=false&orderId=${newOrder._id}`,
        line_items,
        mode:'payment'
     })

     res.json({success:true,session_url:session.url});
    } catch (error) {
    console.error("placeOrderStripe error:", error.message);
    res.json({success:false,message:error.message});  
    }
}


// Verify stripe
const verifyStripe=async(req,res)=>{
    const {success,orderId,userId}=req.body;
     try {
        if(success==='true'){
            await orderModel.findByIdAndUpdate(orderId,{payment:true})
            await userModel.findByIdAndUpdate(userId,{cartData:{}})
            res.json({success:true,message:"Order Placed"})
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({success:false,message:"Payment cancelled or failed"});
        }
     } catch (error) {
        console.error("verifyStripe error:", error.message);
        res.json({success:false,message:error.message});
        
     }
}

// Create Card PaymentIntent & Pending Order
const createCardIntent = async (req, res) => {
    try {
        const { userId, items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.json({ success: false, message: "Cart is empty" });
        }

        const address = await getSanitizedAddress(userId, req.body.address);
        const calculatedAmount = await calculateOrderAmount(items);

        const orderData = {
            userId,
            items,
            address,
            amount: calculatedAmount,
            paymentMethod: "Card",
            payment: false,
            status: "Order Placed",
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(calculatedAmount * 100),
            currency: currency,
            metadata: {
                orderId: newOrder._id.toString(),
                userId: userId.toString()
            },
            description: "ShopKart Order Payment"
        });

        newOrder.stripePaymentIntentId = paymentIntent.id;
        await newOrder.save();

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            orderId: newOrder._id,
            paymentIntentId: paymentIntent.id
        });

    } catch (error) {
        console.error("createCardIntent error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// Verify Card Payment
const verifyCard = async (req, res) => {
    try {
        const { orderId, paymentIntentId, userId } = req.body;

        if (!orderId) {
            return res.json({ success: false, message: "Order ID is required" });
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        if (order.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized order access" });
        }

        // Idempotency: if already verified, return success safely
        if (order.payment) {
            return res.json({ success: true, message: "Order already verified" });
        }

        if (!paymentIntentId) {
            await orderModel.findByIdAndDelete(orderId);
            return res.json({ success: false, message: "PaymentIntent ID is required" });
        }

        let paymentIntent;
        try {
            paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        } catch (retrieveError) {
            console.error("Stripe retrieve error:", retrieveError.message);
            await orderModel.findByIdAndDelete(orderId);
            return res.json({ success: false, message: "Failed to retrieve payment from Stripe" });
        }

        const expectedAmount = Math.round(order.amount * 100);
        const isStatusSucceeded = paymentIntent.status === 'succeeded';
        const isAmountValid = paymentIntent.amount === expectedAmount;
        const isOrderMatch = paymentIntent.metadata?.orderId === orderId.toString();
        const isUserMatch = paymentIntent.metadata?.userId === userId.toString();

        if (isStatusSucceeded && isAmountValid && isOrderMatch && isUserMatch) {
            let cardBrand = '';
            let cardLast4 = '';

            if (paymentIntent.payment_method) {
                try {
                    const pm = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
                    cardBrand = pm.card?.brand || '';
                    cardLast4 = pm.card?.last4 || '';
                } catch (_) {}
            }

            await orderModel.findByIdAndUpdate(orderId, {
                payment: true,
                stripePaymentIntentId: paymentIntent.id,
                cardBrand,
                cardLast4
            });

            await userModel.findByIdAndUpdate(userId, { cartData: {} });

            return res.json({ success: true, message: "Order Placed" });
        } else {
            // Payment not successful or verification mismatch - delete pending unpaid order
            await orderModel.findByIdAndDelete(orderId);
            return res.json({
                success: false,
                message: `Payment verification failed (status: ${paymentIntent.status})`
            });
        }

    } catch (error) {
        console.error("verifyCard error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// Placing order using Razorpay method
 const placeOrderRazorpay=async(req,res)=>{
    
}


// All orders data for admin panel
const allOrders=async(req,res)=>{
try {
    const orders=await orderModel.find({})
    res.json({success:true,orders})

} catch (error) {
    console.log(error);
    res.json({success:false,message:error.message})
}
}

// User Order data for Frontend
const userOrders=async(req,res)=>{
try {
    const {userId}=req.body;
    const orders=await orderModel.find({userId})
    res.json({success:true,orders})
} catch (error) {
    console.log(error);
    res.json({success:false,message:error.message});
}
}

// update Order Status from Admin panel
const updateStatus=async(req,res)=>{
   try {
    const {orderId,status}=req.body;
    await orderModel.findByIdAndUpdate(orderId,{status});
    res.json({success:true,message:"Status Updated"});
   } catch (error) {
    console.log(error);
    res.json({success:false,message:error.message});
   }
}

export {placeOrder,allOrders,userOrders,updateStatus,placeOrderStripe,placeOrderRazorpay,verifyStripe,createCardIntent,verifyCard};
