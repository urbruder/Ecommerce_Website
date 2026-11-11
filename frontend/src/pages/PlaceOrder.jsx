import React, { useContext, useEffect, useState, useRef } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import CardPayment from '../components/CardPayment'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PlaceOrder = () => {

  const [method, setMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);

  const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products, userProfile } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: ''
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData(data => ({ ...data, [name]: value }));
  }

  // Helper: Split single account name into firstName (first token) and lastName (remaining tokens)
  const parseAccountName = (fullName = '') => {
    const trimmed = (fullName || '').trim();
    if (!trimmed) return { firstName: '', lastName: '' };
    const tokens = trimmed.split(/\s+/);
    const firstName = tokens[0] || '';
    const lastName = tokens.slice(1).join(' ');
    return { firstName, lastName };
  };

  // Pre-fill form: Account name and email always win and come from userProfile.
  // Address fields (street, city, state, zipcode, country, phone) pre-fill from userProfile.address.
  useEffect(() => {
    if (userProfile) {
      const fallbackName = userProfile.name || (userProfile.email ? userProfile.email.split('@')[0] : '');
      const { firstName, lastName } = parseAccountName(fallbackName);
      const a = userProfile.address || {};
      setFormData(prev => ({
        ...prev,
        firstName: firstName || prev.firstName,
        lastName: lastName || prev.lastName,
        email: userProfile.email || prev.email,
        street: a.street || prev.street,
        city: a.city || prev.city,
        state: a.state || prev.state,
        zipcode: a.zipcode || prev.zipcode,
        country: a.country || prev.country,
        phone: a.phone || prev.phone,
      }));
    }
  }, [userProfile]);

  const onsubmitHandler = async (event) => {
    event.preventDefault();

    if (loading) return;

    if (!token) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    // Ensure account details are loaded before proceeding
    if (!userProfile) {
      toast.error('Loading your account details. Please try again in a moment.');
      return;
    }

    if (!formData.email) {
      toast.error('Account email is missing. Please log in again.');
      return;
    }

    if (!formData.firstName) {
      toast.error('Please update your name in Profile before placing an order.');
      navigate('/profile');
      return;
    }

    setLoading(true);

    try {
      let orderItems = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const product = products.find(p => p._id === items);
            if (product) {
              const itemInfo = structuredClone(product);
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
            }
          }
        }
      }

      if (orderItems.length === 0) {
        toast.error('Your cart is empty');
        setLoading(false);
        return;
      }

      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee
      };

      switch (method) {
        // Cash on Delivery
        case 'cod': {
          const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } });
          if (response.data.success) {
            setCartItems({});
            navigate('/orders');
          } else {
            toast.error(response.data.message);
            setLoading(false);
          }
          break;
        }

        // Stripe Redirect Checkout
        case 'stripe': {
          const responseStripe = await axios.post(backendUrl + '/api/order/stripe', orderData, { headers: { token } });
          if (responseStripe.data.success) {
            const { session_url } = responseStripe.data;
            window.location.replace(session_url);
          } else {
            toast.error(responseStripe.data.message);
            setLoading(false);
          }
          break;
        }

        // Inline Card Payment via Stripe Elements
        case 'card': {
          if (!cardRef.current) {
            toast.error('Card payment form is not ready. Please refresh.');
            setLoading(false);
            return;
          }

          // Guard: Validate complete card details before contacting server
          if (!cardRef.current.isComplete()) {
            toast.error('Please enter complete card details');
            setLoading(false);
            return;
          }

          // Step 1: Create pending order and Stripe PaymentIntent on backend
          const intentResponse = await axios.post(
            backendUrl + '/api/order/card-intent',
            orderData,
            { headers: { token } }
          );

          if (!intentResponse.data.success) {
            toast.error(intentResponse.data.message || 'Failed to initiate payment');
            setLoading(false);
            return;
          }

          const { clientSecret, orderId, paymentIntentId } = intentResponse.data;

          // Step 2: Confirm card payment via Stripe Elements with read-only account identity
          const billingDetails = {
            name: userProfile?.name || (`${formData.firstName} ${formData.lastName}`.trim() || 'Customer'),
            email: userProfile?.email || formData.email,
            address: {
              line1: formData.street,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipcode,
              country: formData.country && formData.country.trim().length === 2
                ? formData.country.trim().toUpperCase()
                : 'IN'
            }
          };

          let confirmResult;
          try {
            confirmResult = await cardRef.current.confirm(clientSecret, billingDetails);
          } catch (stripeErr) {
            toast.error(stripeErr.message || 'Payment processing failed');
            // Clean up pending unpaid order on error
            try {
              await axios.post(
                backendUrl + '/api/order/verifyCard',
                { orderId, paymentIntentId },
                { headers: { token } }
              );
            } catch (cleanupErr) {
              console.error('Failed to cleanup pending order:', cleanupErr.message);
            }
            setLoading(false);
            return;
          }

          if (confirmResult.error) {
            toast.error(confirmResult.error.message || 'Card payment declined');
            // Clean up pending unpaid order on decline
            try {
              await axios.post(
                backendUrl + '/api/order/verifyCard',
                { orderId, paymentIntentId: confirmResult.error.payment_intent?.id || paymentIntentId },
                { headers: { token } }
              );
            } catch (cleanupErr) {
              console.error('Failed to cleanup pending order:', cleanupErr.message);
            }
            setLoading(false);
            return;
          }

          // Step 3: Server-side verification of PaymentIntent
          const verifiedPaymentIntentId = confirmResult.paymentIntent?.id || paymentIntentId;
          const verifyResponse = await axios.post(
            backendUrl + '/api/order/verifyCard',
            { orderId, paymentIntentId: verifiedPaymentIntentId },
            { headers: { token } }
          );

          if (verifyResponse.data.success) {
            setCartItems({});
            navigate('/orders');
          } else {
            toast.error(verifyResponse.data.message || 'Payment verification failed');
            setLoading(false);
          }
          break;
        }

        default:
          setLoading(false);
          break;
      }

    } catch (error) {
      console.error('PlaceOrder submit error:', error.message);
      toast.error(error.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onsubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
      {/* ..............LEFT SIDE.................. */}
      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
        <div className='text-xl sm:text-2xl my-3'>
          <Title text1={'DELIVERY'} text2={'INFORMATION'} />
          <p className='text-xs text-gray-500 -mt-2'>Great Choice</p>
          <p className='text-base text-gray-800 font-medium py-1.5'>
            Hi, {formData.firstName ? `${formData.firstName} ${formData.lastName}`.trim() : (userProfile?.name || 'Customer')}
          </p>
          <p className='text-xs text-gray-500 -mt-2 py-1.5'>We will send all the confirmation in the below email.</p>
          <a
            href={formData.email ? `mailto:${formData.email}` : undefined}
            className='text-base text-blue-600 underline py-0.5 break-all'
          >
            {formData.email || userProfile?.email || 'Loading email...'}
          </a>
        </div>

        <p className='text-xs text-gray-500 -mt-2'>
          Name and email come from your account. Update your name in <span onClick={() => navigate('/profile')} className='underline cursor-pointer text-black'>Profile</span>.
        </p>

        {/* Editable address fields */}
        <input required onChange={onChangeHandler} name='street' value={formData.street} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Street' />
        <div className='flex gap-3'>
          <input required onChange={onChangeHandler} name='city' value={formData.city} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='City' />
          <input required onChange={onChangeHandler} name='state' value={formData.state} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='State' />
        </div>
        <div className='flex gap-3'>
          <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Zip-code' />
          <input required onChange={onChangeHandler} name='country' value={formData.country} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Country' />
        </div>
        <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Phone' />
      </div>


      {/* ................RIGHT SIDE........................ */}
      <div className='mt-8 sm:mt-0'>
        {/* 1. CartTotal */}
        <div className='my-3 min-w-80'>
          <CartTotal />
        </div>

        {/* 2. ADD CARD section (placed directly between CartTotal and Payment Method) */}
        <div className='mt-12 min-w-80'>
          <div className='text-xl sm:text-2xl my-3'>
            <Title text1={'ADD'} text2={'CARD'} />
          </div>
          <CardPayment
            ref={cardRef}
            active={method === 'card'}
            selected={method === 'card'}
            onSelect={() => setMethod('card')}
          />
        </div>

        {/* 3. PAYMENT METHOD section (Stripe and COD only) */}
        <div className='mt-12 min-w-80'>
          <div className='text-xl sm:text-2xl my-3'>
            <Title text1={'PAYMENT'} text2={'METHOD'} />
          </div>
          {/* ....................PAYMENT METHOD SELECTION............................ */}
          <div className='flex gap-3 flex-col lg:flex-row'>
            <div onClick={() => setMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
              <img className='h-5 mx-4' src={assets.stripe_logo} alt="" />
            </div>
            {/* <div onClick={()=>setMethod('razorpay')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                    <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-green-400': ''} `}></p>
                    <img className='h-5 mx-4' src={assets.razorpay_logo} alt="" />
                  </div> */}
            <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
              <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
            </div>
          </div>

          {/* 4. Single PLACE ORDER button */}
          <div className='w-full text-end mt-8'>
            <button
              type='submit'
              disabled={loading}
              className='bg-black text-white px-16 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-opacity'
            >
              {loading ? 'PROCESSING...' : 'PLACE ORDER'}
            </button>
          </div>

        </div>
      </div>
    </form>
  )
}

export default PlaceOrder
