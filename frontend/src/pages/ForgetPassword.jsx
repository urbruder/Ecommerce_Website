import React, { useState, useContext } from 'react'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'

const ForgotPassword = () => {

  const { backendUrl, navigate } = useContext(ShopContext)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post(
        backendUrl + '/api/user/forgot-password',
        { email }
      )

      if (response.data.success) {
        toast.success('Password reset link sent to your email')
        navigate('/login')
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form 
      onSubmit={onSubmitHandler}
      className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-20 gap-4 text-gray-800'
    >
      <div className='inline-flex items-center gap-2 mb-4'>
        <p className='prata-regular text-3xl'>Forgot Password</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
      </div>

      <p className='text-sm text-gray-600 text-center mb-2'>
        Enter your registered email and we’ll send you a reset link.
      </p>

      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className='w-full px-3 py-2 border border-gray-800'
        placeholder='Email'
      />

      <button 
        disabled={loading}
        className='bg-black text-white font-light px-8 py-2 mt-4 w-full'
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>

      <p 
        onClick={() => navigate('/login')}
        className='text-sm cursor-pointer mt-2'
      >
        Back to Login
      </p>
    </form>
  )
}

export default ForgotPassword
