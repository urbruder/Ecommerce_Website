import React, { useState, useCallback, useContext, useEffect, useRef } from 'react';
import { ShopContext } from '../../context/ShopContext';
import ChatLauncher from './ChatLauncher';
import ChatWindow from './ChatWindow';
import { processMessage, getQuickActionQuery } from './chatbotLogic';
import axios from 'axios';
import './chatbotStyles.css';

let messageIdCounter = 0;
function generateId() {
  return `msg_${Date.now()}_${++messageIdCounter}`;
}

const ChatBot = () => {
  const { products, navigate, backendUrl } = useContext(ShopContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('chatbot_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Maintain conversation history for context-aware Gemini responses
  const conversationHistoryRef = useRef(
    (() => {
      try {
        const saved = localStorage.getItem('chatbot_history');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    })()
  );

  // Toggle chat window
  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Close chat window
  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Process bot response — Backend API with client-side fallback
  const getBotResponse = useCallback(
    async (userText) => {
      setIsTyping(true);
      setIsLoading(true);

      // Add user message to conversation history
      conversationHistoryRef.current.push({
        role: 'user',
        content: userText
      });

      try {
        // ─── Try Backend API first ───
        const response = await axios.post(`${backendUrl}/api/chat`, {
          message: userText,
          conversationHistory: conversationHistoryRef.current.slice(-10) // Last 10 messages for context
        });

        const { answer, source, confidence } = response.data;

        if (answer) {
          // Backend returned a valid response
          const botMessage = {
            id: generateId(),
            sender: 'bot',
            text: answer,
            source, // 'faq' or 'gemini'
            confidence,
            timestamp: Date.now(),
          };

          // Also try to find matching products to show alongside the answer
          const clientResponse = processMessage(userText, products, navigate);
          if (clientResponse.products && clientResponse.products.length > 0) {
            botMessage.products = clientResponse.products;
          }

          // Handle order tracking navigation
          if (userText.toLowerCase().includes('track') && userText.toLowerCase().includes('order')) {
            setTimeout(() => navigate('/orders'), 2000);
          }

          setMessages((prev) => [...prev, botMessage]);

          // Add to conversation history
          conversationHistoryRef.current.push({
            role: 'assistant',
            content: answer
          });

          setIsTyping(false);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.log('[ChatBot] Backend unavailable, using client-side fallback:', error.message);
      }

      // ─── Client-side fallback if backend fails ───
      const response = processMessage(userText, products, navigate);

      if (response.action === 'navigate_orders') {
        const botMessage = {
          id: generateId(),
          sender: 'bot',
          text: response.text,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setTimeout(() => navigate('/orders'), 1500);
      } else {
        const botMessage = {
          id: generateId(),
          sender: 'bot',
          text: response.text,
          products: response.products || null,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, botMessage]);
      }

      // Add fallback response to conversation history
      conversationHistoryRef.current.push({
        role: 'assistant',
        content: response.text
      });

      setIsTyping(false);
      setIsLoading(false);
    },
    [products, navigate, backendUrl]
  );

  // Handle user sending a message
  const handleSend = useCallback(
    (text) => {
      const userMessage = {
        id: generateId(),
        sender: 'user',
        text,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      getBotResponse(text);
    },
    [getBotResponse]
  );

  // Handle quick action chip click
  const handleQuickAction = useCallback(
    (chip) => {
      const query = getQuickActionQuery(chip);
      handleSend(query);
    },
    [handleSend]
  );

  // Keyboard: Escape closes chat
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Limit stored messages and conversation history, and save to localStorage
  useEffect(() => {
    let currentMessages = messages;
    if (messages.length > 100) {
      currentMessages = messages.slice(-80);
      setMessages(currentMessages);
    }
    localStorage.setItem('chatbot_messages', JSON.stringify(currentMessages));
    
    if (conversationHistoryRef.current.length > 20) {
      conversationHistoryRef.current = conversationHistoryRef.current.slice(-16);
    }
    localStorage.setItem('chatbot_history', JSON.stringify(conversationHistoryRef.current));
  }, [messages]);

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <ChatWindow
          messages={messages}
          isTyping={isTyping}
          isLoading={isLoading}
          onSend={handleSend}
          onQuickAction={handleQuickAction}
          onClose={closeChat}
        />
      )}

      {/* Floating Launcher Button */}
      <ChatLauncher isOpen={isOpen} onClick={toggleChat} />
    </>
  );
};

export default ChatBot;
