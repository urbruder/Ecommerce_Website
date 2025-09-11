import React from 'react'
import { Route,Routes } from 'react-router-dom'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Login from './pages/Login'
import Orders from './pages/Orders'
import Product from './pages/Product'
import Contact from './pages/Contact'
import Cart from './pages/Cart'
import PlaceOrder from './pages/PlaceOrder'
import Navbar from './components/Navbar'
import Searchbar from './components/Searchbar'
import Footer from './components/Footer'
import { ToastContainer, toast } from 'react-toastify';
import Verify from './pages/Verify'

const App = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <ToastContainer/>
    <Navbar/>
    <Searchbar/>
           <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/collection' element={<Collection/>}/>
            <Route path='/about' element={<About/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/orders' element={<Orders/>}/>
            <Route path='/contact' element={<Contact/>}/>
            <Route path='/product/:productId' element={<Product/>}/>
            <Route path='/cart' element={<Cart/>}/>
            <Route path='/place-order' element={<PlaceOrder/>}/>
            <Route path='/verify' element={<Verify/>}/>



           </Routes>
           <Footer/>

    </div>
  )
}

export default App
