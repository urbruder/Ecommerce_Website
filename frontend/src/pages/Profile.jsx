import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import { toast } from 'react-toastify'
import axios from 'axios'

const Profile = () => {
    const { token, setToken, setCartItems, navigate, backendUrl, userProfile, setUserProfile } = useContext(ShopContext);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState({
        firstName: '', lastName: '', street: '',
        city: '', state: '', zipcode: '', country: '', phone: ''
    });
    const [saving, setSaving] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!token) navigate('/login');
    }, [token]);

    // Populate fields from context profile
    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name || '');
            setEmail(userProfile.email || '');
            setAddress({
                firstName: userProfile.address?.firstName || '',
                lastName:  userProfile.address?.lastName  || '',
                street:    userProfile.address?.street    || '',
                city:      userProfile.address?.city      || '',
                state:     userProfile.address?.state     || '',
                zipcode:   userProfile.address?.zipcode   || '',
                country:   userProfile.address?.country   || '',
                phone:     userProfile.address?.phone     || '',
            });
        }
    }, [userProfile]);

    const onAddressChange = (e) => {
        setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await axios.post(
                backendUrl + '/api/user/update-profile',
                { name, address },
                { headers: { token } }
            );
            if (response.data.success) {
                setUserProfile({ name, email, address });
                toast.success('Profile updated successfully!');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
        setSaving(false);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken('');
        setCartItems({});
        setUserProfile(null);
        navigate('/login');
    };

    const inputClass = 'border border-gray-300 rounded py-1.5 px-3.5 w-full focus:outline-none focus:border-gray-500 transition-colors';

    return (
        <div className='border-t pt-14 min-h-[80vh]'>
            <div className='max-w-2xl mx-auto'>

                {/* Header */}
                <div className='text-2xl mb-8'>
                    <Title text1={'MY'} text2={'PROFILE'} />
                </div>

                <form onSubmit={handleSave} className='flex flex-col gap-6'>

                    {/* ── Account Info ── */}
                    <div>
                        <p className='text-sm font-medium text-gray-700 uppercase tracking-wide mb-3'>
                            Account Information
                        </p>
                        <div className='flex flex-col gap-3'>
                            <div className='flex flex-col gap-1'>
                                <label className='text-xs text-gray-500'>Full Name</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={inputClass}
                                    type='text'
                                    placeholder='Full name'
                                    required
                                />
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='text-xs text-gray-500'>Email Address</label>
                                <input
                                    value={email}
                                    className={`${inputClass} bg-gray-50 cursor-not-allowed text-gray-400`}
                                    type='email'
                                    readOnly
                                    title='Email cannot be changed'
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Divider ── */}
                    <hr className='border-gray-200' />

                    {/* ── Saved Address ── */}
                    <div>
                        <p className='text-sm font-medium text-gray-700 uppercase tracking-wide mb-3'>
                            Saved Delivery Address
                        </p>
                        <p className='text-xs text-gray-400 mb-4'>
                            This address will be suggested automatically when you place an order.
                        </p>
                        <div className='flex flex-col gap-3'>
                            <div className='flex gap-3'>
                                <div className='flex flex-col gap-1 w-full'>
                                    <label className='text-xs text-gray-500'>First Name</label>
                                    <input name='firstName' value={address.firstName} onChange={onAddressChange} className={inputClass} type='text' placeholder='First name' />
                                </div>
                                <div className='flex flex-col gap-1 w-full'>
                                    <label className='text-xs text-gray-500'>Last Name</label>
                                    <input name='lastName' value={address.lastName} onChange={onAddressChange} className={inputClass} type='text' placeholder='Last name' />
                                </div>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='text-xs text-gray-500'>Street Address</label>
                                <input name='street' value={address.street} onChange={onAddressChange} className={inputClass} type='text' placeholder='Street' />
                            </div>
                            <div className='flex gap-3'>
                                <div className='flex flex-col gap-1 w-full'>
                                    <label className='text-xs text-gray-500'>City</label>
                                    <input name='city' value={address.city} onChange={onAddressChange} className={inputClass} type='text' placeholder='City' />
                                </div>
                                <div className='flex flex-col gap-1 w-full'>
                                    <label className='text-xs text-gray-500'>State</label>
                                    <input name='state' value={address.state} onChange={onAddressChange} className={inputClass} type='text' placeholder='State' />
                                </div>
                            </div>
                            <div className='flex gap-3'>
                                <div className='flex flex-col gap-1 w-full'>
                                    <label className='text-xs text-gray-500'>Zip Code</label>
                                    <input name='zipcode' value={address.zipcode} onChange={onAddressChange} className={inputClass} type='text' placeholder='Zip code' />
                                </div>
                                <div className='flex flex-col gap-1 w-full'>
                                    <label className='text-xs text-gray-500'>Country</label>
                                    <input name='country' value={address.country} onChange={onAddressChange} className={inputClass} type='text' placeholder='Country' />
                                </div>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='text-xs text-gray-500'>Phone Number</label>
                                <input name='phone' value={address.phone} onChange={onAddressChange} className={inputClass} type='tel' placeholder='Phone' />
                            </div>
                        </div>
                    </div>

                    {/* ── Actions ── */}
                    <div className='flex items-center justify-between mt-2 border-t pt-6'>
                        <button
                            type='button'
                            onClick={logout}
                            className='border border-gray-300 text-gray-600 px-8 py-3 text-sm hover:bg-gray-50 hover:border-gray-400 transition-colors'
                        >
                            LOGOUT
                        </button>
                        <button
                            type='submit'
                            disabled={saving}
                            className='bg-black text-white px-16 py-3 text-sm hover:bg-gray-800 transition-colors disabled:opacity-60'
                        >
                            {saving ? 'SAVING...' : 'SAVE CHANGES'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Profile
