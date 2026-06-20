export type MessageType = 'reminder' | 'suggestion' | 'appointment';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  workId: string;
  workTitle: string;
  type: MessageType;
  content: string;
  template: string;
  isRead: boolean;
  createdAt: string;
}

export interface MessageTemplate {
  type: MessageType;
  title: string;
  description: string;
  icon: string;
  template: string;
}
