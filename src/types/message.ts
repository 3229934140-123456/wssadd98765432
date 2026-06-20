export type MessageTemplateType = 'reminder' | 'suggestion' | 'appointment';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'author' | 'editor';
  receiverId: string;
  receiverName: string;
  workId: string;
  workTitle: string;
  content: string;
  templateType?: MessageTemplateType;
  read: boolean;
  createdAt: string;
}

export interface MessageTemplate {
  type: MessageTemplateType;
  title: string;
  description: string;
  icon: string;
  template: string;
}
