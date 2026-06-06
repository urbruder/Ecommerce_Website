import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatTypingIndicator from './ChatTypingIndicator';
import ChatWelcome from './ChatWelcome';

const ChatMessages = ({ messages, isTyping, onQuickAction }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive or typing state changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  return (
    <div
      ref={containerRef}
      className='flex-1 min-h-0 overflow-y-auto px-4 py-3 chatbot-messages-scroll'
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
      id="chatbot-messages-area"
    >
      {/* Welcome Screen stays at top */}
      <ChatWelcome onAction={onQuickAction} />

      <div role="list">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>

      {isTyping && <ChatTypingIndicator />}

      {/* Invisible anchor for auto-scroll */}
      <div ref={messagesEndRef} aria-hidden="true" />
    </div>
  );
};

export default React.memo(ChatMessages);
