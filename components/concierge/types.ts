export type AvatarState = 'idle' | 'thinking' | 'talking';

export interface ConciergeMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: ToolAction[];
  suggestions?: string[];
  feedback?: 1 | -1 | null;
  created_at: string;
}

export interface ToolAction {
  id: string;
  label: string;
  url: string;
}

export interface ConciergeChatResponse {
  reply: string;
  actions: ToolAction[];
  suggestions: string[];
  remainingMessages: number;
  sessionId: string;
}

export interface ConciergeChatHistoryResponse {
  messages: ConciergeMessage[];
  sessionId: string;
}
