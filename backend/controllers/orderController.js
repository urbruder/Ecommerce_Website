import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// Placing order using COD method
 const placeOrder=async(req,res)=>{
try {
    const {userId,items,amount,address}=req.body;
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
    console.log(error);
    res.json({success:false,message:error.message});
}
}

// Placing order using Stripe method
 const placeOrderStripe=async(req,res)=>{
    
}


// Placing order using Razorpay method
 const placeOrderRazorpay=async(req,res)=>{
    
}


// All orders data for admin panel
const allOrders=async(req,res)=>{

}

// User Order data for Frontend
const userOrders=async(req,res)=>{

}

// update Order Status from Admin panel
const updateStatus=async(req,res)=>{

}

export {placeOrder,allOrders,userOrders,updateStatus,placeOrderStripe,placeOrderRazorpay};
