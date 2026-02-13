
export interface BotConfig {
  id: string;
  name: string;
  websiteUrl: string;
  systemPrompt: string;
  knowledgeText: string;
  status: 'active' | 'draft' | 'archived';
  createdAt: number;
  lastUpdated: number;
  themeColor: string;
  welcomeMessage: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface PDFData {
  name: string;
  base64: string;
  type: string;
}
