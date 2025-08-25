export interface AISettings {
  systemPrompt: string;
  model: 'gpt-4.1' | 'gpt-4' | 'gpt-3.5-turbo';
  temperature: number;
  maxTokens: number;
  apiKey: string;
}

export interface GoogleSheetsSettings {
  sheetId: string;
  sheetName: string;
  gid: string;
}

export interface AppSettings {
  aiSettings: AISettings;
  googleSheetsSettings: GoogleSheetsSettings;
}
