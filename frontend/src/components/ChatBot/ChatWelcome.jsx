import React from 'react';
import ChatQuickActions from './ChatQuickActions';

const ChatWelcome = ({ onAction }) => {
  return (
    <div className='px-4 py-5' id="chatbot-welcome">
      {/* Greeting */}
      <div className='text-center mb-4'>
        <p className='text-3xl mb-2'>👋</p>
        <h3 className='prata-regular text-lg text-gray-800 mb-1'>
          Hi there!
        </h3>
        <p className='text-sm text-gray-500 leading-relaxed'>
          Looking for the perfect outfit today?<br />
          I can help you discover amazing styles!
        </p>
      </div>

      {/* Capabilities */}
      <div className='bg-gray-50 rounded-xl p-3 mb-4'>
        <p className='text-xs font-medium text-gray-500 uppercase tracking-wider mb-2'>
          I can help with
        </p>
        <div className='grid grid-cols-2 gap-1.5'>
          {[
            { emoji: '🎯', label: 'Recommendations' },
            { emoji: '👗', label: 'Outfit Ideas' },
            { emoji: '📏', label: 'Size Guidance' },
            { emoji: '📦', label: 'Order Tracking' },
            { emoji: '↩️', label: 'Returns & Exchanges' },
            { emoji: '🌸', label: 'Seasonal Picks' },
          ].map((item) => (
            <div key={item.label} className='flex items-center gap-1.5 text-xs text-gray-600'>
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider with label */}
      <div className='flex items-center gap-2 mb-3'>
        <div className='flex-1 h-px bg-gray-200' />
        <span className='text-[10px] text-gray-400 uppercase tracking-wider font-medium'>Quick Actions</span>
        <div className='flex-1 h-px bg-gray-200' />
      </div>

      {/* Quick Action Chips */}
      <ChatQuickActions onAction={onAction} />
    </div>
  );
};

export default React.memo(ChatWelcome);
