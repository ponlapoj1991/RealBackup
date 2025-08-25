import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { useSettings } from './SettingsContext';

export interface AISettings {
  systemPrompt: string;
  model: 'gpt-4.1' | 'gpt-4' | 'gpt-3.5-turbo';
  temperature: number;
  maxTokens: number;
  apiKey: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AIState {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

export type AIAction =
  | { type: 'TOGGLE_CHAT' }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_MESSAGES' };

const initialState: AIState = {
  isOpen: false,
  messages: [],
  isLoading: false,
  error: null
};

function aiReducer(state: AIState, action: AIAction): AIState {
  switch (action.type) {
    case 'TOGGLE_CHAT':
      return { ...state, isOpen: !state.isOpen };
    
    case 'ADD_MESSAGE':
      return { 
        ...state, 
        messages: [...state.messages, action.payload],
        error: null
      };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    
    default:
      return state;
  }
}

interface AIContextType {
  state: AIState;
  settings: AISettings;
  dispatch: React.Dispatch<AIAction>;
  sendMessage: (message: string, dashboardContext?: any) => Promise<void>;
  toggleChat: () => void;
  clearChat: () => void;
}

const AIContext = createContext<AIContextType | null>(null);

export function AIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(aiReducer, initialState);
  const { settings } = useSettings();

  const toggleChat = () => {
    dispatch({ type: 'TOGGLE_CHAT' });
  };

  const clearChat = () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  };

  const sendMessage = async (message: string, dashboardContext?: any) => {
    if (!settings.aiSettings.apiKey) {
      dispatch({ type: 'SET_ERROR', payload: 'Please set your OpenAI API Key in Settings.' });
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const messages = [
        { role: 'system', content: settings.aiSettings.systemPrompt },
        ...(dashboardContext ? [{
          role: 'system',
          content: `Current Dashboard Context: ${JSON.stringify(dashboardContext, null, 2)}`
        }] : []),
        ...state.messages.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.aiSettings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.aiSettings.model,
          messages,
          temperature: settings.aiSettings.temperature,
          max_tokens: settings.aiSettings.maxTokens
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API Error');
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });

    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Connection error' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <AIContext.Provider value={{
      state,
      settings: settings.aiSettings,
      dispatch,
      sendMessage,
      toggleChat,
      clearChat
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}
