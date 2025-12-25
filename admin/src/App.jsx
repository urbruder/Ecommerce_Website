import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Route, Routes, Navigate } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import Login from './components/Login'
import { ToastContainer } from 'react-toastify'
import axios from 'axios'

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = '$'

const App = () => {
  // Use of this token is to maintain the login state of the admin
  // If the token is present in localStorage, it means the admin is logged in
  // Token means the JWT token received from the backend after successful login

  // Earlier:
  // const [token, setToken] = useState('')
  // This forced login on every refresh ❌ (not suitable for large-scale apps)

  // Now:
  // We read token from localStorage so admin remains logged in
  // Backend will decide whether token is valid or expired
  const [token, setToken] = useState(localStorage.getItem('token'))

  // This loading state ensures that UI is not rendered
  // until backend verifies whether the token is valid or not
  const [loading, setLoading] = useState(true)

  // This effect runs once when the app loads
  // It verifies the token with backend
  // If token is invalid or expired, admin is logged out automatically
  useEffect(() => {
    const verifyAdmin = async () => {
      // If no token is present, directly show login
      if (!token) {
        setLoading(false)
        return
      }

      try {
        // Backend verification of JWT token
        await axios.get(`${backendUrl}/api/admin/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      } catch (error) {
        // If token is invalid or expired
        // Remove token and force login
        localStorage.removeItem('token')
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    verifyAdmin()
  }, [token])

  // This stores the token in localStorage whenever it changes
  // This allows persistent login across refreshes and browser restarts
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    }
  }, [token])

  // While verifying token, show a loading screen
  // This prevents blank UI or unauthorized access
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Checking authentication...
      </div>
    )
  }

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer />
      {/* This component is used to show toast notifications */}

      {/* If token is not present, show Login page */}
      {!token ? (
        <Login setToken={setToken} />
      ) : (
        <>
          {/* If token is valid, show admin dashboard */}
          <Navbar setToken={setToken} />
          <hr />
          <div className='flex w-full'>
            <Sidebar />
            <div className='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
              <Routes>
                {/* Default route redirects to Add page */}
                <Route path='/' element={<Navigate to='/add' />} />

                <Route path='/add' element={<Add token={token} />} />
                <Route path='/list' element={<List token={token} />} />
                <Route path='/orders' element={<Orders token={token} />} />

                {/* Any unknown route redirects to Add */}
                <Route path='*' element={<Navigate to='/add' />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default App
