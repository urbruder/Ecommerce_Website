import React, { useState, useRef, useEffect } from 'react';
import { IoSend } from 'react-icons/io5';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const ChatInput = ({ onSend, isLoading }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const isEmpty = value.trim().length === 0;

  return (
    <div className='border-t border-gray-200 bg-white rounded-b-2xl p-3' id="chatbot-input-area">
      <div className='flex items-center gap-2'>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about products, sizes, orders..."
          className='flex-1 bg-gray-50 rounded-full px-4 py-2.5 text-sm outline-none border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-black/5 transition-all duration-200 placeholder:text-gray-400'
          disabled={isLoading}
          aria-label="Type a message"
          id="chatbot-message-input"
          autoComplete="off"
        />
        <button
          onClick={handleSend}
          disabled={isEmpty || isLoading}
          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
            isEmpty || isLoading
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-black text-white hover:bg-gray-800 active:scale-95'
          }`}
          aria-label="Send message"
          id="chatbot-send-button"
        >
          {isLoading ? (
            <AiOutlineLoading3Quarters className='w-4 h-4 animate-spin' />
          ) : (
            <IoSend className='w-4 h-4' />
          )}
        </button>
      </div>
    </div>
  );
};

export default React.memo(ChatInput);
