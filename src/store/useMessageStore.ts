import { create } from 'zustand';
import type { Message, MessageTemplateType } from '../types/message';
import { messages as mockMessages } from '../utils/mockData';
import { formatDateTime } from '../utils/dateUtils';
import {
  saveToStorage,
  loadFromStorage,
  STORAGE_KEYS,
} from '../utils/storage';
import { useWorkStore } from './useWorkStore';
import { useUserStore } from './useUserStore';

interface MessageState {
  messages: Message[];
  markAsRead: (workId: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: () => number;
  getUnreadCountByWork: (workId: string) => number;
  getMessagesByWork: (workId: string) => Message[];
  getMessagesByWorkSorted: (workId: string) => Message[];
  sendMessage: (workId: string, content: string, templateType?: MessageTemplateType) => void;
  sendTemplateMessage: (workId: string, templateType: MessageTemplateType) => void;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function initializeMessages(): Message[] {
  const stored = loadFromStorage<Message[] | null>(STORAGE_KEYS.MESSAGES, null);
  if (stored) return stored;
  return mockMessages;
}

const initialMessages = initializeMessages();

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: initialMessages,

  markAsRead: (workId) => {
    set(state => {
      const newMessages = state.messages.map(m =>
        m.workId === workId ? { ...m, read: true } : m
      );
      saveToStorage(STORAGE_KEYS.MESSAGES, newMessages);
      return { messages: newMessages };
    });
  },

  markAllAsRead: () => {
    set(state => {
      const newMessages = state.messages.map(m => ({ ...m, read: true }));
      saveToStorage(STORAGE_KEYS.MESSAGES, newMessages);
      return { messages: newMessages };
    });
  },

  getUnreadCount: () => {
    const { currentUser } = useUserStore.getState();
    if (!currentUser) return 0;
    return get().messages.filter(m => !m.read && m.receiverId === currentUser.id).length;
  },

  getUnreadCountByWork: (workId) => {
    const { currentUser } = useUserStore.getState();
    if (!currentUser) return 0;
    return get().messages.filter(
      m => m.workId === workId && !m.read && m.receiverId === currentUser.id
    ).length;
  },

  getMessagesByWork: (workId) => get().messages.filter(m => m.workId === workId),

  getMessagesByWorkSorted: (workId) => {
    return get()
      .getMessagesByWork(workId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  sendMessage: (workId, content, templateType) => {
    const { currentUser } = useUserStore.getState();
    if (!currentUser) return;

    const work = useWorkStore.getState().getWorkById(workId);
    if (!work) return;

    const receiverId = currentUser.role === 'editor' ? work.authorId : work.editorId;
    const receiverName = currentUser.role === 'editor' ? work.authorName : '编辑';

    const newMessage: Message = {
      id: generateId(),
      workId,
      workTitle: work.title,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      receiverId,
      receiverName,
      content,
      templateType,
      read: false,
      createdAt: formatDateTime(new Date()),
    };

    set(state => {
      const newMessages = [...state.messages, newMessage];
      saveToStorage(STORAGE_KEYS.MESSAGES, newMessages);
      return { messages: newMessages };
    });
  },

  sendTemplateMessage: (workId, templateType) => {
    const templates: Record<MessageTemplateType, string> = {
      reminder: '您好，注意到您近期的更新节奏有所放缓，建议保持稳定的更新频率哦。如果有任何困难可以随时和我沟通~',
      suggestion: '建议您可以先发一篇番外稳住读者，或者将长章拆分为两章发布，这样能更好地保持读者粘性。',
      appointment: '想和您约个时间沟通一下近期的创作情况，请问您什么时候方便呢？',
    };

    const content = templates[templateType];
    get().sendMessage(workId, content, templateType);

    const { addFollowupHistory, updateFollowupStatus } = useWorkStore.getState();
    const work = useWorkStore.getState().getWorkById(workId);
    if (!work) return;

    const oldStatus = work.followupStatus;
    const newStatus = templateType === 'appointment' ? 'appointed' : 'reminded';

    if (oldStatus !== newStatus) {
      updateFollowupStatus(workId, newStatus);
    } else {
      addFollowupHistory(workId, 'message_sent', {
        messageType: templateType,
      });
    }
  },
}));
