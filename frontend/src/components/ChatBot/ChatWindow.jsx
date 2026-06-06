import React from 'react';
import ChatHeader from './ChatHeader';
import ChatWelcome from './ChatWelcome';
import ChatMessages from './ChatMessages';
import ChatQuickActions from './ChatQuickActions';
import ChatInput from './ChatInput';

const ChatWindow = ({ messages, isTyping, isLoading, onSend, onQuickAction, onClose }) => {
  const hasMessages = messages.length > 0;

  return (
    <div
      className='fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[380px] md:w-[420px] max-w-[420px] bg-white rounded-2xl shadow-2xl flex flex-col chatbot-window-enter overflow-hidden'
      style={{
        maxHeight: 'calc(100vh - 8rem)',
        zIndex: 9998,
      }}
      role="dialog"
      aria-label="Shopping Assistant Chat"
      aria-modal="true"
      id="chatbot-window"
    >
      {/* Header — never shrinks */}
      <div className='flex-shrink-0'>
        <ChatHeader onClose={onClose} />
      </div>

      {/* Content Area */}
      {/* Content Area - Messages now contains Welcome at the top */}
      <ChatMessages messages={messages} isTyping={isTyping} onQuickAction={onQuickAction} />
      
      {/* Quick actions strip — only show if conversation has started */}
      {hasMessages && (
        <div className='flex-shrink-0 border-t border-gray-100 bg-gray-50/50 overflow-x-auto chatbot-chips-scroll'>
          <div className='flex gap-1.5 px-3 py-2 min-w-max'>
            {['🎯 Best Sellers', '🛍️ New Arrivals', '📏 Size Guide'].map((chip) => (
              <button
                key={chip}
                onClick={() => onQuickAction(chip)}
                className='inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border border-gray-200 bg-white text-gray-500 hover:bg-black hover:text-white hover:border-black transition-all duration-200 whitespace-nowrap'
                tabIndex={0}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area — never shrinks */}
      <div className='flex-shrink-0'>
        <ChatInput onSend={onSend} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default React.memo(ChatWindow);

