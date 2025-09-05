
export interface Asset {
  id: string;
  name: string;
  description: string;
  type: 'stage' | 'workflow';
  isNew?: boolean;
  category: string;
  owner: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  isGenerating?: boolean;
}
