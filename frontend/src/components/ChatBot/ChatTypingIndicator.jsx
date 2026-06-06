import React from 'react';

const ChatTypingIndicator = () => {
  return (
    <div className='flex items-start gap-2 mb-3 chatbot-message-enter' role="status" aria-label="Assistant is typing">
      <div className='bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 inline-flex items-center gap-1.5'>
        <span className='w-2 h-2 bg-gray-400 rounded-full chatbot-typing-dot' />
        <span className='w-2 h-2 bg-gray-400 rounded-full chatbot-typing-dot' />
        <span className='w-2 h-2 bg-gray-400 rounded-full chatbot-typing-dot' />
      </div>
    </div>
  );
};

export default React.memo(ChatTypingIndicator);
