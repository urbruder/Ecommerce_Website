import React from 'react';
import ChatProductCard from './ChatProductCard';

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';
  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div
      className={`flex flex-col mb-3 chatbot-message-enter ${isUser ? 'items-end' : 'items-start'}`}
      role="listitem"
    >
      {/* Text Bubble */}
      {message.text && (
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
            isUser
              ? 'bg-black text-white rounded-2xl rounded-br-sm max-w-[80%]'
              : 'bg-gray-100 text-gray-700 rounded-2xl rounded-bl-sm max-w-[85%]'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Product Cards */}
      {message.products && message.products.length > 0 && (
        <div className='mt-2 w-full max-w-[90%] flex flex-col gap-2'>
          {message.products.map((product) => (
            <ChatProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Timestamp */}
      {time && (
        <span className={`text-[10px] text-gray-400 mt-1 ${isUser ? 'mr-1' : 'ml-1'}`}>
          {time}
        </span>
      )}
    </div>
  );
};

export default React.memo(ChatMessage);
