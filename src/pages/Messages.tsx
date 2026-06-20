import { useState } from 'react';
import {
  Bell,
  Lightbulb,
  Calendar,
  CheckCircle2,
  Filter,
  Inbox,
  Send,
} from 'lucide-react';
import { useMessageStore } from '../store/useMessageStore';
import { useUserStore } from '../store/useUserStore';
import { getAuthorById } from '../utils/mockData';
import { formatRelativeTime } from '../utils/dateUtils';
import type { Message, MessageType } from '../types/message';
import { cn } from '../lib/utils';

const typeIcons: Record<MessageType, typeof Bell> = {
  reminder: Bell,
  suggestion: Lightbulb,
  appointment: Calendar,
};

const typeLabels: Record<MessageType, string> = {
  reminder: '提醒',
  suggestion: '建议',
  appointment: '预约',
};

const typeColors: Record<MessageType, {
  bg: string;
  icon: string;
  text: string;
}> = {
  reminder: {
    bg: 'bg-blue-50',
    icon: 'text-blue-500',
    text: 'text-blue-700',
  },
  suggestion: {
    bg: 'bg-amber-50',
    icon: 'text-amber-500',
    text: 'text-amber-700',
  },
  appointment: {
    bg: 'bg-purple-50',
    icon: 'text-purple-500',
    text: 'text-purple-700',
  },
};

export function Messages() {
  const { currentUser } = useUserStore();
  const {
    getFilteredMessages,
    filterType,
    filterRead,
    setFilterType,
    setFilterRead,
    markAsRead,
    markAllAsRead,
  } = useMessageStore();

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const messages = currentUser ? getFilteredMessages(currentUser.id) : [];
  const unreadCount = currentUser ? useMessageStore.getState().getUnreadCount(currentUser.id) : 0;

  const typeFilters = [
    { value: 'all', label: '全部' },
    { value: 'reminder', label: '提醒' },
    { value: 'suggestion', label: '建议' },
    { value: 'appointment', label: '预约' },
  ];

  const readFilters = [
    { value: 'all', label: '全部' },
    { value: 'unread', label: '未读' },
    { value: 'read', label: '已读' },
  ];

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead && currentUser && message.receiverId === currentUser.id) {
      markAsRead(message.id);
    }
  };

  const handleMarkAllRead = () => {
    if (currentUser) {
      markAllAsRead(currentUser.id);
    }
  };

  const getMessageSender = (message: Message) => {
    if (message.senderId.startsWith('editor')) {
      return { name: '编辑', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor' };
    }
    const author = getAuthorById(message.senderId);
    return author ? { name: author.name, avatar: author.avatar } : { name: '未知', avatar: '' };
  };

  const getMessageReceiver = (message: Message) => {
    if (message.receiverId.startsWith('editor')) {
      return { name: '编辑', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor' };
    }
    const author = getAuthorById(message.receiverId);
    return author ? { name: author.name, avatar: author.avatar } : { name: '未知', avatar: '' };
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold text-stone-800"
            style={{ fontFamily: "'Source Han Serif SC', serif" }}
          >
            消息中心
          </h1>
          <p className="text-stone-500 mt-2">
            查看与编辑的沟通记录
            {unreadCount > 0 && (
              <span className="ml-2 text-rose-500">{unreadCount} 条未读消息</span>
            )}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#1e3a5f] bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            全部标为已读
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400" />
          <span className="text-sm text-stone-500">消息类型：</span>
          <div className="flex rounded-lg border border-stone-200 overflow-hidden">
            {typeFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterType(filter.value)}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-all',
                  filterType === filter.value
                    ? 'bg-[#1e3a5f] text-white'
                    : 'bg-white text-stone-600 hover:bg-stone-50'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Inbox className="w-4 h-4 text-stone-400" />
          <span className="text-sm text-stone-500">阅读状态：</span>
          <div className="flex rounded-lg border border-stone-200 overflow-hidden">
            {readFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterRead(filter.value)}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-all',
                  filterRead === filter.value
                    ? 'bg-[#1e3a5f] text-white'
                    : 'bg-white text-stone-600 hover:bg-stone-50'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-4 border-b border-stone-100">
            <h3 className="font-semibold text-stone-800">消息列表</h3>
          </div>
          <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="p-12 text-center text-stone-500">
                暂无消息
              </div>
            ) : (
              messages.map((message) => {
                const Icon = typeIcons[message.type];
                const colors = typeColors[message.type];
                const sender = getMessageSender(message);
                const isSent = currentUser && message.senderId === currentUser.id;
                const isSelected = selectedMessage?.id === message.id;

                return (
                  <button
                    key={message.id}
                    onClick={() => handleSelectMessage(message)}
                    className={cn(
                      'w-full p-4 text-left transition-all hover:bg-stone-50',
                      isSelected && 'bg-stone-50',
                      !message.isRead && currentUser && message.receiverId === currentUser.id && 'bg-blue-50/50'
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="relative">
                        <img
                          src={isSent ? currentUser?.avatar : sender.avatar}
                          alt=""
                          className="w-10 h-10 rounded-full bg-stone-100"
                        />
                        <div
                          className={cn(
                            'absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center',
                            colors.bg
                          )}
                        >
                          <Icon className={cn('w-3 h-3', colors.icon)} />
                        </div>
                        {!message.isRead && currentUser && message.receiverId === currentUser.id && (
                          <span className="absolute -top-0.5 -left-0.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-stone-800 text-sm">
                            {isSent ? (
                              <span className="flex items-center gap-1">
                                <Send className="w-3 h-3 text-stone-400" />
                                发送给 {getMessageReceiver(message).name}
                              </span>
                            ) : (
                              `来自 ${sender.name}`
                            )}
                          </span>
                          <span className="text-xs text-stone-400">
                            {formatRelativeTime(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-stone-700 truncate">
                          《{message.workTitle}》
                        </p>
                        <p className="text-xs text-stone-500 truncate mt-0.5">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          {selectedMessage ? (
            <div className="h-[600px] flex flex-col">
              <div className="p-6 border-b border-stone-100">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={getMessageSender(selectedMessage).avatar}
                      alt=""
                      className="w-12 h-12 rounded-full bg-stone-100"
                    />
                    <div
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full flex items-center justify-center',
                        typeColors[selectedMessage.type].bg
                      )}
                    >
                      {(() => {
                        const Icon = typeIcons[selectedMessage.type];
                        return <Icon className={cn('w-3.5 h-3.5', typeColors[selectedMessage.type].icon)} />;
                      })()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-stone-800">
                        {getMessageSender(selectedMessage).name}
                      </h3>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          typeColors[selectedMessage.type].bg,
                          typeColors[selectedMessage.type].text
                        )}
                      >
                        {typeLabels[selectedMessage.type]}
                      </span>
                    </div>
                    <p className="text-sm text-stone-500">
                      关于《{selectedMessage.workTitle}》
                    </p>
                  </div>
                  <span className="text-sm text-stone-400">
                    {selectedMessage.createdAt}
                  </span>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <div className="bg-stone-50 rounded-2xl p-6 max-w-2xl">
                  <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.content}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <Inbox className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500">选择一条消息查看详情</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
