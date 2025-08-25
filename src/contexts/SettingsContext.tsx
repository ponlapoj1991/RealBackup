import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AISettings } from './AIContext';

export interface GoogleSheetsSettings {
  sheetId: string;
  sheetName: string;
  gid: string;
}

export interface AppSettings {
  aiSettings: AISettings;
  googleSheetsSettings: GoogleSheetsSettings;
}

const initialSettings: AppSettings = {
  aiSettings: {
    systemPrompt: 'You are an expert Social Media data analyst AI assistant. Provide insightful analysis based on the current dashboard context.',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
    apiKey: ''
  },
  googleSheetsSettings: {
    sheetId: '',
    sheetName: '',
    gid: ''
  }
};

const loadSettings = (): AppSettings => {
  try {
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return {
        aiSettings: { ...initialSettings.aiSettings, ...parsed.aiSettings },
        googleSheetsSettings: { ...initialSettings.googleSheetsSettings, ...parsed.googleSheetsSettings }
      };
    }
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
  }
  return initialSettings;
};

type SettingsAction = { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> };

const settingsReducer = (state: AppSettings, action: SettingsAction): AppSettings => {
  switch (action.type) {
    case 'UPDATE_SETTINGS':
      const newState = { 
        ...state,
        aiSettings: { ...state.aiSettings, ...action.payload.aiSettings },
        googleSheetsSettings: { ...state.googleSheetsSettings, ...action.payload.googleSheetsSettings }
      };
      try {
        localStorage.setItem('app-settings', JSON.stringify(newState));
      } catch (error) {
        console.error('Failed to save settings to localStorage:', error);
      }
      return newState;
    default:
      return state;
  }
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, dispatch] = useReducer(settingsReducer, initialSettings, loadSettings);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
