import React from 'react';
import { IoChatbubbleEllipsesOutline, IoClose } from 'react-icons/io5';

const ChatLauncher = ({ isOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-4 sm:right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-black/20 ${
        isOpen
          ? 'bg-gray-800 hover:bg-gray-700 rotate-0'
          : 'bg-black hover:bg-gray-800 chatbot-launcher-pulse'
      }`}
      style={{ zIndex: 9999 }}
      aria-label={isOpen ? 'Close shopping assistant' : 'Open shopping assistant'}
      aria-expanded={isOpen}
      aria-controls="chatbot-window"
      id="chatbot-launcher"
    >
      <span className='text-white chatbot-icon-enter' key={isOpen ? 'close' : 'open'}>
        {isOpen ? (
          <IoClose className='w-6 h-6' />
        ) : (
          <IoChatbubbleEllipsesOutline className='w-6 h-6' />
        )}
      </span>
    </button>
  );
};

export default React.memo(ChatLauncher);
