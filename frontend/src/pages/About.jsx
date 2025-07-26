import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const About = () => {
  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t'>
           <Title text1={'ABOUT'} text2={'US'}/>
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img src={assets.about_img} className='w-full md:max-w-[450px]' alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
        <p>ShopKart was born out of a passion for innovation and a desire to revolutionize the way people shop online. Our journey began with a simple idea: to provide a platform where customer can easily discover, explore, and purchase a wide range of products. </p>
        <p>ShopKart – Your one-stop online store for everything you need, from fashion to electronics, delivered to your doorstep.</p>
        <b className='text-gray-800'>Our Mission</b>
        <p>At ShopKart, our mission is to make online shopping effortless, affordable, and accessible for everyone by delivering quality products, unbeatable value, and exceptional customer service — all in one trusted platform.</p>

        </div>
      </div>

      <div className='text-xl py-4'>
         <Title text1={'WHY'} text2={'CHOOSE US'}/>
      </div>
      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Quality Assurance:</b>
            <p className='text-gray-600'>At ShopKart, quality isn’t just a promise — it’s our priority. Every product listed on our platform goes through a strict quality check to ensure it meets the highest standards. Whether it's electronics, fashion, or daily essentials, we partner only with trusted suppliers and verified sellers to deliver genuine, durable, and top-notch products to your doorstep.</p>
       </div>
       <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Convenience:</b>
            <p className='text-gray-600'>Shopping with ShopKart is designed to fit seamlessly into your lifestyle. With a user-friendly interface, fast search, easy checkout, and doorstep delivery — you can shop anytime, anywhere. No crowds, no queues, no hassle — just a few clicks, and your order is on its way!</p>
       </div>
       <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Exceptional Customer Service:</b>
            <p className='text-gray-600'>At ShopKart, our customers come first. Our dedicated support team is always ready to assist you — from tracking orders to resolving issues swiftly. Whether you have a question, concern, or just need help choosing the right product, we're here to ensure your experience is smooth, friendly, and satisfying every step of the way.</p>
       </div> 
      </div>
      <NewsletterBox/>
    </div>
  )
}

export default About
