import React, { useEffect, useState } from 'react'
import {ShopContext} from '../context/ShopContext'
import { assets } from '../assets/assets'
import { useLocation } from 'react-router-dom'
const Searchbar = () => {
    const {search,setSearch,showSearch,setShowSearch}=React.useContext(ShopContext)
const location=useLocation();
const [visible,setVisible]=useState(false)
// This state will control the visibility of the search bar based on the current route
// If the route is '/collection', the search bar will be visible, otherwise it will be
 useEffect(()=>{
    // Check if the current path includes 'collection'
    // If it does, set visible to true, otherwise set it to false
    if(location.pathname.includes('collection')){
        setVisible(true)
    }
    else{
        setVisible(false)
    }
 },[location])



// The search bar will only be shown if showSearch is true and visible is true
// This allows the search bar to be conditionally rendered based on the current route
  return showSearch && visible? (
    <div className=' border-t border-b bg-gray-50 text-center'>
        <div className='inline-flex items-center justify-center border border-gray-400 px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2'>
            <input value={search} onChange={(e)=>setSearch(e.target.value)} type="text" placeholder='Search' className='flex-1 outline-none bg-inherit text-sm'  />
            <img className='w-4' src={assets.search_icon} alt="" />
        </div>
        <img onClick={()=>setShowSearch(false)} className='inline w-3 cursor-pointer' src={assets.cross_icon} alt="" />
      
    </div>
  ): null
}

export default Searchbar
