import { create } from 'zustand';
import type { Message, MessageType } from '../types/message';
import { messages, messageTemplates } from '../utils/mockData';
import { formatDateTime } from '../utils/dateUtils';

interface MessageState {
  messages: Message[];
  messageTemplates: typeof messageTemplates;
  filterType: string;
  filterRead: string;
  setFilterType: (type: string) => void;
  setFilterRead: (read: string) => void;
  getFilteredMessages: (userId: string) => Message[];
  getUnreadCount: (userId: string) => number;
  markAsRead: (messageId: string) => void;
  markAllAsRead: (userId: string) => void;
  sendMessage: (data: {
    senderId: string;
    receiverId: string;
    workId: string;
    workTitle: string;
    type: MessageType;
    content: string;
    template: string;
  }) => void;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages,
  messageTemplates,
  filterType: 'all',
  filterRead: 'all',

  setFilterType: (type) => set({ filterType: type }),
  setFilterRead: (read) => set({ filterRead: read }),

  getFilteredMessages: (userId) => {
    const { messages, filterType, filterRead } = get();
    return messages.filter(m => {
      const isRelated = m.senderId === userId || m.receiverId === userId;
      const matchesType = filterType === 'all' || m.type === filterType;
      const matchesRead = filterRead === 'all' ||
        (filterRead === 'unread' && !m.isRead) ||
        (filterRead === 'read' && m.isRead);
      return isRelated && matchesType && matchesRead;
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getUnreadCount: (userId) => {
    return get().messages.filter(m => m.receiverId === userId && !m.isRead).length;
  },

  markAsRead: (messageId) => {
    set(state => ({
      messages: state.messages.map(m =>
        m.id === messageId ? { ...m, isRead: true } : m
      ),
    }));
  },

  markAllAsRead: (userId) => {
    set(state => ({
      messages: state.messages.map(m =>
        m.receiverId === userId ? { ...m, isRead: true } : m
      ),
    }));
  },

  sendMessage: (data) => {
    const newMessage: Message = {
      id: generateId(),
      ...data,
      isRead: false,
      createdAt: formatDateTime(new Date()),
    };
    set(state => ({
      messages: [newMessage, ...state.messages],
    }));
  },
}));
