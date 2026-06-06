import React from 'react';
import { QUICK_ACTIONS } from './chatbotLogic';

const ChatQuickActions = ({ onAction }) => {
  const handleClick = (chip) => {
    onAction(chip);
  };

  const handleKeyDown = (e, chip) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onAction(chip);
    }
  };

  return (
    <div
      className='flex flex-wrap gap-2 px-4 py-2'
      role="group"
      aria-label="Quick actions"
      id="chatbot-quick-actions"
    >
      {QUICK_ACTIONS.map((chip) => (
        <button
          key={chip}
          onClick={() => handleClick(chip)}
          onKeyDown={(e) => handleKeyDown(e, chip)}
          className='inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:bg-black hover:text-white hover:border-black active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-black/20 whitespace-nowrap'
          tabIndex={0}
          role="button"
          aria-label={chip}
        >
          {chip}
        </button>
      ))}
    </div>
  );
};

export default React.memo(ChatQuickActions);
