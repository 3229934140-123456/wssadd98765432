import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Bell,
  Lightbulb,
  Calendar,
  CheckCircle2,
  Filter,
  Inbox,
  Send,
  BookOpen,
  MessageSquare,
  ChevronRight,
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

interface WorkMessageGroup {
  workId: string;
  workTitle: string;
  messages: Message[];
  latestMessage: Message;
  unreadCount: number;
}

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

  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const allMessages = currentUser ? getFilteredMessages(currentUser.id) : [];
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

  const workGroups = (() => {
    const groupsMap = new Map<string, WorkMessageGroup>();
    allMessages.forEach((msg) => {
      const existing = groupsMap.get(msg.workId);
      const isUnread = !msg.isRead && currentUser && msg.receiverId === currentUser.id;
      if (existing) {
        existing.messages.push(msg);
        if (isUnread) existing.unreadCount++;
        if (new Date(msg.createdAt) > new Date(existing.latestMessage.createdAt)) {
          existing.latestMessage = msg;
        }
      } else {
        groupsMap.set(msg.workId, {
          workId: msg.workId,
          workTitle: msg.workTitle,
          messages: [msg],
          latestMessage: msg,
          unreadCount: isUnread ? 1 : 0,
        });
      }
    });
    return Array.from(groupsMap.values()).sort(
      (a, b) =>
        new Date(b.latestMessage.createdAt).getTime() -
        new Date(a.latestMessage.createdAt).getTime()
    );
  })();

  const selectedGroup = selectedWorkId ? workGroups.find(g => g.workId === selectedWorkId) || null : null;
  const selectedMessages = useMemo(() => (
    selectedGroup
      ? [...selectedGroup.messages.sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )]
      : []
  ), [selectedGroup]);

  const handleSelectWork = (groupId: string) => {
    setSelectedWorkId(groupId);
    if (currentUser) {
      const group = workGroups.find(g => g.workId === groupId);
      if (group) {
        group.messages.forEach(msg => {
          if (!msg.isRead && msg.receiverId === currentUser.id) {
            markAsRead(msg.id);
          }
        });
      }
    }
  };

  const handleMarkAllRead = () => {
    if (currentUser) {
      markAllAsRead(currentUser.id);
    }
  };

  const getMessageUser = (userId: string) => {
    if (userId.startsWith('editor')) {
      return { name: '编辑', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor' };
    }
    const author = getAuthorById(userId);
    return author ? { name: author.name, avatar: author.avatar } : { name: '未知', avatar: '' };
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedMessages]);

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
            查看与编辑/作者的沟通记录
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
            <h3 className="font-semibold text-stone-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#1e3a5f]" />
              按作品分组
              <span className="text-xs text-stone-400 ml-auto">{workGroups.length} 个作品</span>
            </h3>
          </div>
          <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto scrollbar-thin">
            {workGroups.length === 0 ? (
              <div className="p-12 text-center text-stone-500">
                暂无消息
              </div>
            ) : (
              workGroups.map((group) => {
                const sender = getMessageUser(group.latestMessage.senderId);
                const isSelected = selectedWorkId === group.workId;
                const isSent = currentUser && group.latestMessage.senderId === currentUser.id;

                return (
                  <button
                    key={group.workId}
                    onClick={() => handleSelectWork(group.workId)}
                    className={cn(
                      'w-full p-4 text-left transition-all hover:bg-stone-50',
                      isSelected && 'bg-stone-50'
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-6 h-6 text-white/80" />
                        </div>
                        {group.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5">
                            {group.unreadCount > 9 ? '9+' : group.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-stone-800 truncate">
                            《{group.workTitle}》
                          </p>
                          <span className="text-xs text-stone-400 flex-shrink-0 ml-2">
                            {formatRelativeTime(group.latestMessage.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                          <p className="text-xs text-stone-400 truncate">
                            {isSent ? (
                              <span className="flex items-center gap-1">
                                <Send className="w-3 h-3 inline" />
                                我：
                              </span>
                            ) : (
                              <span>{sender.name}：</span>
                            )}
                            {group.latestMessage.content}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className={cn(
                        'w-4 h-4 flex-shrink-0 transition-colors',
                        isSelected ? 'text-[#1e3a5f]' : 'text-stone-300'
                      )} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          {selectedGroup ? (
            <div className="h-[600px] flex flex-col">
              <div className="p-6 border-b border-stone-100 bg-gradient-to-r from-[#1e3a5f]/5 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center">
                    <BookOpen className="w-7 h-7 text-white/80" />
                  </div>
                  <div className="flex-1">
                    <h3
                      className="font-bold text-stone-800 text-lg"
                      style={{ fontFamily: "'Source Han Serif SC', serif" }}
                    >
                      《{selectedGroup.workTitle}》
                    </h3>
                    <p className="text-sm text-stone-500">
                      共 {selectedGroup.messages.length} 条沟通记录
                    </p>
                  </div>
                  {selectedGroup.unreadCount > 0 && (
                    <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-medium">
                      {selectedGroup.unreadCount} 条未读
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto scrollbar-thin bg-stone-50/50 space-y-4">
                {selectedMessages.map((message, idx) => {
                  const isMe = currentUser && message.senderId === currentUser.id;
                  const user = getMessageUser(message.senderId);
                  const Icon = typeIcons[message.type];
                  const colors = typeColors[message.type];
                  const prevMessage = idx > 0 ? selectedMessages[idx - 1] : null;
                  const showDateDivider =
                    !prevMessage ||
                    prevMessage.createdAt.slice(0, 10) !== message.createdAt.slice(0, 10);

                  return (
                    <div key={message.id}>
                      {showDateDivider && (
                        <div className="flex items-center gap-4 my-6">
                          <div className="flex-1 h-px bg-stone-200" />
                          <span className="text-xs text-stone-400">
                            {message.createdAt.slice(0, 10)}
                          </span>
                          <div className="flex-1 h-px bg-stone-200" />
                        </div>
                      )}

                      <div className={cn(
                        'flex gap-3',
                        isMe ? 'flex-row-reverse' : ''
                      )}>
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-9 h-9 rounded-full bg-stone-200 flex-shrink-0"
                        />
                        <div className={cn(
                          'max-w-[70%]',
                          isMe ? 'items-end' : ''
                        )}>
                          <div className={cn(
                            'flex items-center gap-2 mb-1 text-xs text-stone-500',
                            isMe ? 'justify-end' : ''
                          )}>
                            <span className="font-medium text-stone-700">
                              {isMe ? '我' : user.name}
                            </span>
                            <span
                              className={cn(
                                'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded',
                                colors.bg,
                                colors.text
                              )}
                            >
                              <Icon className="w-3 h-3" />
                              {typeLabels[message.type]}
                            </span>
                            <span>{message.createdAt.slice(11, 16)}</span>
                          </div>
                          <div className={cn(
                            'rounded-2xl px-4 py-3',
                            isMe
                              ? 'bg-[#1e3a5f] text-white rounded-tr-md'
                              : 'bg-white border border-stone-200 text-stone-700 rounded-tl-md shadow-sm'
                          )}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>
          ) : (
            <div className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <Inbox className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500">选择一个作品查看沟通记录</p>
                <p className="text-xs text-stone-400 mt-1">
                  同一作品下的来回消息会串在一起展示
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
