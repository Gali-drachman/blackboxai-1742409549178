import { useState, useCallback, useEffect, useRef } from 'react';
import { useApi } from './useApi';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export function useChat(initialMessages = []) {
  const [messages, setMessages] = useState(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt4');
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  // API hooks
  const { execute: sendMessageApi, isLoading: isSending } = useApi(api.chat.sendMessage);
  const { execute: fetchHistory, isLoading: isLoadingHistory } = useApi(api.chat.getHistory);
  const { execute: clearHistory } = useApi(api.chat.deleteHistory);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load chat history
  const loadHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      const history = await fetchHistory();
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }, [user, fetchHistory]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Add a new message
  const addMessage = useCallback((content, role = 'user') => {
    const newMessage = {
      id: Date.now(),
      content,
      role,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  // Send a message
  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage = addMessage(content, 'user');

    // Show typing indicator
    setIsTyping(true);

    try {
      // Send message to API
      const response = await sendMessageApi({
        message: content,
        model: selectedModel
      });

      // Add AI response
      addMessage(response.content, 'assistant');
    } catch (error) {
      // Remove user message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsTyping(false);
    }
  }, [addMessage, sendMessageApi, selectedModel]);

  // Clear chat
  const clearChat = useCallback(async () => {
    try {
      await clearHistory();
      setMessages([]);
    } catch (error) {
      console.error('Failed to clear chat:', error);
    }
  }, [clearHistory]);

  // Update message
  const updateMessage = useCallback((messageId, updates) => {
    setMessages(prev =>
      prev.map(message =>
        message.id === messageId
          ? { ...message, ...updates }
          : message
      )
    );
  }, []);

  // Delete message
  const deleteMessage = useCallback((messageId) => {
    setMessages(prev =>
      prev.filter(message => message.id !== messageId)
    );
  }, []);

  // Get chat statistics
  const getChatStats = useCallback(() => {
    return {
      totalMessages: messages.length,
      userMessages: messages.filter(m => m.role === 'user').length,
      aiMessages: messages.filter(m => m.role === 'assistant').length,
      averageResponseTime: calculateAverageResponseTime(messages)
    };
  }, [messages]);

  // Helper function to calculate average response time
  const calculateAverageResponseTime = (messages) => {
    let totalTime = 0;
    let responsePairs = 0;

    for (let i = 0; i < messages.length - 1; i++) {
      if (messages[i].role === 'user' && messages[i + 1].role === 'assistant') {
        const userTime = new Date(messages[i].timestamp).getTime();
        const aiTime = new Date(messages[i + 1].timestamp).getTime();
        totalTime += aiTime - userTime;
        responsePairs++;
      }
    }

    return responsePairs > 0 ? totalTime / responsePairs : 0;
  };

  // Export available AI models
  const availableModels = [
    { id: 'gpt4', name: 'GPT-4', tokensPerMessage: 8 },
    { id: 'gemini', name: 'Gemini', tokensPerMessage: 5 },
    { id: 'claude', name: 'Claude', tokensPerMessage: 6 },
    { id: 'deepseek', name: 'DeepSeek', tokensPerMessage: 4 }
  ];

  return {
    messages,
    isTyping,
    isSending,
    isLoadingHistory,
    selectedModel,
    availableModels,
    messagesEndRef,
    sendMessage,
    clearChat,
    updateMessage,
    deleteMessage,
    setSelectedModel,
    getChatStats
  };
}

export default useChat;