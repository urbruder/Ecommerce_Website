import React from 'react'
import { FaInstagram, FaFacebook, FaXTwitter } from 'react-icons/fa6'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div>
      <div className='flex flex-col sm:grid grid-cols-[2fr_1fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
        {/* Sm:grid and grif cols make all the div come in the same line */}
         <div>
            <img className='mb-5 w-32' src={assets.real_logo} alt="" />
            <p className='w-full md:w-2/3 text-gray-600'>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. 
            </p>
         </div>
         <div>
          <p className='text-xl font-medium mb-5'>COMPANY</p>
          <ul className='flex flex-col gap-1 text-gray-600'>
            <li>Home</li>
            <li>About Us</li>
            <li>Delivery</li>
            <li>Privacy policy</li>
          </ul>
         </div>
         <div>
          <p className='text-xl font-medium mb-5'>SOCIALS</p>
          <ul className='flex flex-col gap-1 text-gray-600'>
            <li className='flex items-center gap-2'>
              <FaInstagram/>
              <a href="https://www.instagram.com/">Instagram</a>
            </li>
            <li className='flex items-center gap-2'>
              <FaFacebook/>
              <a href="https://www.facebook.com/">Facebook</a>
            </li>
            <li className='flex items-center gap-2'>
              <FaXTwitter/>
              <a href="https://x.com/?lang=en">Twitter</a>
            </li>
          </ul>
         </div>
         <div>
          <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-1 text-gray-600'>
            <li>+918697778712</li>
            <li>harshsingh123@gmail.com</li>
          </ul>
         </div>
      </div>
      <div>
        <hr />
        <p className='py-5 text-center text-sm'>Copyright 2024@ Shopkart.com - All Rights Reserved</p>
      </div>
    </div>
  )
}

export default Footer
