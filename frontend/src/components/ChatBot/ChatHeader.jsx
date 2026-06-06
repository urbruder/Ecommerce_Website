import React from 'react';
import { IoClose } from 'react-icons/io5';
import { assets } from '../../assets/assets';

const ChatHeader = ({ onClose }) => {
  return (
    <div
      className='bg-black text-white rounded-t-2xl px-4 py-3 flex items-center justify-between flex-shrink-0'
      id="chatbot-header"
    >
      {/* Left: Avatar + Name + Status */}
      <div className='flex items-center gap-3'>
        {/* Brand Avatar */}
        <div className='w-9 h-9 rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0'>
          <img
            src={assets.real_logo}
            alt="Shopkart"
            className='w-7 h-7 object-contain'
          />
        </div>

        {/* Name & Status */}
        <div>
          <h2 className='text-sm font-medium leading-tight'>Style Advisor</h2>
          <div className='flex items-center gap-1.5 mt-0.5'>
            <span className='w-1.5 h-1.5 rounded-full bg-green-400 inline-block' />
            <span className='text-[10px] text-gray-300 font-light'>Online</span>
          </div>
        </div>
      </div>

      {/* Right: Close Button */}
      <button
        onClick={onClose}
        className='w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors duration-200'
        aria-label="Close chat"
        id="chatbot-close-button"
      >
        <IoClose className='w-5 h-5' />
      </button>
    </div>
  );
};

export default React.memo(ChatHeader);
