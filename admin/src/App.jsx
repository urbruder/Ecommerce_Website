import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Route, Routes } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import Login from './components/Login'
 import { ToastContainer } from 'react-toastify';
  
export const backendUrl=import.meta.env.VITE_BACKEND_URL
export const currency='$'
const App = () => {
//Use of this token is to maintain the login state of the admin
//If the token is present in localStorage, it means the admin is logged in
//Token means the JWT token received from the backend after successful login
  const [token, setToken] = useState(localStorage.getItem('token')? localStorage.getItem('token'):'')
//This checks if the token is present in localStorage when the component mounts
//If the token is present, it sets the token state to the value from localStorage
   
useEffect(()=>{
  localStorage.setItem('token',token);
},[token])

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer/>
      {/* This component is used to show toast notifications */}
      {token === '' ? <Login setToken={setToken} /> :
        <>
          <Navbar setToken={setToken} />
          <hr />
          <div className='flex w-full'>
            <Sidebar />
            <div className='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
              <Routes>
                <Route path='/add' element={<Add token={token} />} />
                <Route path='/list' element={<List token={token} />} />
                <Route path='/orders' element={<Orders token={token} />} />
              </Routes>
            </div>
          </div>
        </>
      }



    </div>
  )
}

export default App
