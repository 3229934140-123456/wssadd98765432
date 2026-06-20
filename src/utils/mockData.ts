import type { User } from '../types/user';
import type { Work, DailyStatus, UpdateStatus, FollowupStatus } from '../types/work';
import type { Message, MessageTemplate } from '../types/message';
import { formatDate, formatDateTime, formatTime, getDateDaysAgo } from './dateUtils';
import { calculateRiskLevel, calculateRiskReasons } from './riskCalculator';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const authorNames = [
  '林雨辰', '苏墨白', '夜轻尘', '顾清风', '沈琉璃',
  '江云帆', '楚云曦', '许安年', '柳若烟', '陆星遥',
  '莫轻言', '花满楼', '风无涯', '雪千寻', '月凌霜'
];

const workTitles = [
  '星河长明', '剑影江湖', '浮生若梦', '云海仙踪', '盛世长安',
  '彼岸花开', '龙行天下', '凤舞九天', '锦绣山河', '烟雨江南',
  '大漠孤烟', '长河落日', '月华初上', '星辰大海', '岁月静好'
];

const categories = ['玄幻', '都市', '仙侠', '历史', '科幻', '悬疑', '言情', '武侠'];

const coverColors = [
  'from-slate-700 to-slate-900',
  'from-amber-600 to-amber-800',
  'from-emerald-600 to-emerald-800',
  'from-blue-600 to-blue-800',
  'from-rose-600 to-rose-800',
  'from-purple-600 to-purple-800',
  'from-indigo-600 to-indigo-800',
  'from-cyan-600 to-cyan-800',
];

export const authors: User[] = authorNames.map((name, index) => ({
  id: `author-${index + 1}`,
  name,
  role: 'author' as const,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
}));

export const editors: User[] = [
  {
    id: 'editor-1',
    name: '李编辑',
    role: 'editor' as const,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor1',
  },
  {
    id: 'editor-2',
    name: '王主编',
    role: 'editor' as const,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor2',
  },
];

export const users: User[] = [...authors, ...editors];

function generateDailyStatuses(workId: string, riskPattern: 'green' | 'yellow' | 'red'): DailyStatus[] {
  const statuses: DailyStatus[] = [];
  const baseWordCount = 4000 + Math.floor(Math.random() * 3000);

  for (let i = 6; i >= 0; i--) {
    const date = getDateDaysAgo(i);
    let wordCount = baseWordCount;
    let draftCount = 3 + Math.floor(Math.random() * 5);
    let updateStatus: UpdateStatus = 'published';
    let publishTime: string | undefined;
    let onLeave = false;
    let leaveReason: string | undefined;

    if (riskPattern === 'red') {
      if (i === 0) {
        updateStatus = 'delayed';
        wordCount = 0;
        draftCount = 0;
      } else if (i === 1) {
        wordCount = Math.floor(baseWordCount * 0.4);
        draftCount = 1;
        publishTime = formatTime(new Date(date.getTime() + 20 * 3600000));
      } else {
        wordCount = Math.floor(baseWordCount * (0.7 - i * 0.08));
        draftCount = Math.max(0, 2 - Math.floor(i / 2));
        publishTime = formatTime(new Date(date.getTime() + 12 * 3600000 + Math.random() * 8 * 3600000));
      }
    } else if (riskPattern === 'yellow') {
      if (i === 0) {
        draftCount = 1 + Math.floor(Math.random() * 2);
        wordCount = Math.floor(baseWordCount * 0.6);
        updateStatus = 'pending';
      } else if (i <= 2) {
        wordCount = Math.floor(baseWordCount * (0.8 - i * 0.1));
        draftCount = 2;
        publishTime = formatTime(new Date(date.getTime() + 14 * 3600000));
      } else {
        wordCount = baseWordCount;
        draftCount = 4;
        publishTime = formatTime(new Date(date.getTime() + 10 * 3600000));
      }
    } else {
      wordCount = baseWordCount + Math.floor(Math.random() * 1000) - 500;
      draftCount = 4 + Math.floor(Math.random() * 4);
      publishTime = formatTime(new Date(date.getTime() + 9 * 3600000 + Math.random() * 3 * 3600000));
      if (i === 3 && Math.random() > 0.7) {
        onLeave = true;
        leaveReason = '家中有事请假一天';
      }
    }

    statuses.push({
      id: generateId(),
      workId,
      date: formatDate(date),
      wordCount: Math.max(0, wordCount),
      draftCount,
      updateStatus,
      publishTime,
      onLeave,
      leaveReason,
      createdAt: formatDateTime(date),
    });
  }

  return statuses;
}

export const works: Work[] = [];
export const dailyStatuses: DailyStatus[] = [];

const riskPatterns: Array<'green' | 'yellow' | 'red'> = [
  'red', 'red', 'red',
  'yellow', 'yellow', 'yellow', 'yellow', 'yellow',
  'green', 'green', 'green', 'green', 'green', 'green', 'green',
];

const followupPatterns: FollowupStatus[] = [
  'untreated', 'reminded', 'appointed',
  'untreated', 'reminded', 'reminded', 'appointed', 'resolved',
  'resolved', 'resolved', 'untreated', 'resolved', 'resolved', 'resolved', 'resolved',
];

const resolutionNotes: Record<number, string> = {
  7: '作者已恢复更新节奏，近三日日均码字5000+，存稿恢复至5章',
  8: '作者请假三天处理家事，现已回归正常更新',
  9: '调整更新计划为两日一更，与读者沟通后反响良好',
  11: '作者卡文期已过，剧情进入新阶段，更新恢复稳定',
  12: '存稿已补充至8章，后续更新有保障',
  13: '与作者沟通后制定了新的创作时间表，执行情况良好',
  14: '作者参加完婚礼已回归，更新恢复正常节奏',
};

workTitles.forEach((title, index) => {
  const author = authors[index % authors.length];
  const editor = editors[index % editors.length];
  const riskPattern = riskPatterns[index];
  const workId = `work-${index + 1}`;
  const followupStatus = followupPatterns[index];

  const workStatuses = generateDailyStatuses(workId, riskPattern);
  dailyStatuses.push(...workStatuses);

  const riskLevel = calculateRiskLevel(workStatuses);
  const riskReasons = calculateRiskReasons(workStatuses);

  const work: Work = {
    id: workId,
    title,
    cover: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`,
    authorId: author.id,
    editorId: editor.id,
    authorName: author.name,
    category: categories[index % categories.length],
    totalWords: 500000 + index * 30000 + Math.floor(Math.random() * 100000),
    status: 'ongoing',
    riskLevel,
    riskReasons,
    followupStatus,
  };

  if (followupStatus === 'resolved' && resolutionNotes[index]) {
    work.resolutionNote = resolutionNotes[index];
    work.resolvedAt = formatDateTime(getDateDaysAgo(Math.floor(Math.random() * 3) + 1));
  }

  works.push(work);
});

export const messageTemplates: MessageTemplate[] = [
  {
    type: 'reminder',
    title: '温和提醒',
    description: '友好提醒作者关注更新节奏，了解当前存稿状况',
    icon: 'Bell',
    template: '您好，注意到《{workTitle}》近日更新节奏有所放缓，目前存稿 {draftCount} 章。建议合理安排时间，如有困难随时沟通~',
  },
  {
    type: 'suggestion',
    title: '补更建议',
    description: '提供具体的应对方案，帮助作者渡过更新难关',
    icon: 'Lightbulb',
    template: '建议：1) 先发一章番外稳住读者 2) 将长章拆分为两章发布 3) 提前发单章说明情况。您可以根据实际情况选择~',
  },
  {
    type: 'appointment',
    title: '沟通预约',
    description: '预约时间进行深入沟通，了解作者的真实困难',
    icon: 'Calendar',
    template: '关于《{workTitle}》的后续更新计划，想和您约个时间沟通一下。请问您本周什么时间段方便呢？',
  },
];

const leaveReasons = [
  '这两天身体不舒服，更新会晚一点',
  '公司项目赶进度，这周比较忙',
  '回老家处理点事情，请假三天',
  '卡文了，需要调整一下剧情',
  '参加朋友婚礼，请假一天',
];

function getUserName(id: string): string {
  const user = users.find(u => u.id === id);
  return user?.name || '未知用户';
}

function getUserRole(id: string): 'author' | 'editor' {
  return id.startsWith('editor') ? 'editor' : 'author';
}

export const messages: Message[] = [
  {
    id: generateId(),
    senderId: 'editor-1',
    senderName: getUserName('editor-1'),
    senderRole: getUserRole('editor-1'),
    receiverId: 'author-1',
    receiverName: getUserName('author-1'),
    workId: 'work-1',
    workTitle: '星河长明',
    content: '您好，注意到《星河长明》近日更新节奏有所放缓，目前存稿 0 章。建议合理安排时间，如有困难随时沟通~',
    templateType: 'reminder',
    read: false,
    createdAt: formatDateTime(getDateDaysAgo(0)),
  },
  {
    id: generateId(),
    senderId: 'editor-1',
    senderName: getUserName('editor-1'),
    senderRole: getUserRole('editor-1'),
    receiverId: 'author-2',
    receiverName: getUserName('author-2'),
    workId: 'work-2',
    workTitle: '剑影江湖',
    content: '建议：1) 先发一章番外稳住读者 2) 将长章拆分为两章发布 3) 提前发单章说明情况。您可以根据实际情况选择~',
    templateType: 'suggestion',
    read: true,
    createdAt: formatDateTime(getDateDaysAgo(1)),
  },
  {
    id: generateId(),
    senderId: 'editor-2',
    senderName: getUserName('editor-2'),
    senderRole: getUserRole('editor-2'),
    receiverId: 'author-3',
    receiverName: getUserName('author-3'),
    workId: 'work-3',
    workTitle: '浮生若梦',
    content: '关于《浮生若梦》的后续更新计划，想和您约个时间沟通一下。请问您本周什么时间段方便呢？',
    templateType: 'appointment',
    read: false,
    createdAt: formatDateTime(getDateDaysAgo(2)),
  },
  {
    id: generateId(),
    senderId: 'editor-1',
    senderName: getUserName('editor-1'),
    senderRole: getUserRole('editor-1'),
    receiverId: 'author-4',
    receiverName: getUserName('author-4'),
    workId: 'work-4',
    workTitle: '云海仙踪',
    content: '您好，注意到《云海仙踪》近日更新节奏有所放缓，目前存稿 2 章。建议合理安排时间，如有困难随时沟通~',
    templateType: 'reminder',
    read: true,
    createdAt: formatDateTime(getDateDaysAgo(3)),
  },
  {
    id: generateId(),
    senderId: 'author-5',
    senderName: getUserName('author-5'),
    senderRole: getUserRole('author-5'),
    receiverId: 'editor-1',
    receiverName: getUserName('editor-1'),
    workId: 'work-5',
    workTitle: '盛世长安',
    content: leaveReasons[0],
    read: false,
    createdAt: formatDateTime(getDateDaysAgo(0)),
  },
  {
    id: generateId(),
    senderId: 'author-6',
    senderName: getUserName('author-6'),
    senderRole: getUserRole('author-6'),
    receiverId: 'editor-2',
    receiverName: getUserName('editor-2'),
    workId: 'work-6',
    workTitle: '彼岸花开',
    content: leaveReasons[1],
    read: true,
    createdAt: formatDateTime(getDateDaysAgo(1)),
  },
  {
    id: generateId(),
    senderId: 'editor-1',
    senderName: getUserName('editor-1'),
    senderRole: getUserRole('editor-1'),
    receiverId: 'author-7',
    receiverName: getUserName('author-7'),
    workId: 'work-7',
    workTitle: '龙行天下',
    content: '建议：1) 先发一章番外稳住读者 2) 将长章拆分为两章发布 3) 提前发单章说明情况。您可以根据实际情况选择~',
    templateType: 'suggestion',
    read: true,
    createdAt: formatDateTime(getDateDaysAgo(4)),
  },
  {
    id: generateId(),
    senderId: 'author-7',
    senderName: getUserName('author-7'),
    senderRole: getUserRole('author-7'),
    receiverId: 'editor-1',
    receiverName: getUserName('editor-1'),
    workId: 'work-7',
    workTitle: '龙行天下',
    content: '好的，感谢建议！我已经准备了两章番外，这两天就发出来。后续我会调整更新节奏，保证稳定更新。',
    read: true,
    createdAt: formatDateTime(getDateDaysAgo(3)),
  },
  {
    id: generateId(),
    senderId: 'editor-1',
    senderName: getUserName('editor-1'),
    senderRole: getUserRole('editor-1'),
    receiverId: 'author-7',
    receiverName: getUserName('author-7'),
    workId: 'work-7',
    workTitle: '龙行天下',
    content: '太好了！看到你已经恢复更新节奏，近三天日均码字都在5000以上，存稿也回到5章了，继续保持~',
    read: true,
    createdAt: formatDateTime(getDateDaysAgo(2)),
  },
  {
    id: generateId(),
    senderId: 'author-8',
    senderName: getUserName('author-8'),
    senderRole: getUserRole('author-8'),
    receiverId: 'editor-1',
    receiverName: getUserName('editor-1'),
    workId: 'work-8',
    workTitle: '凤舞九天',
    content: '周四下午3点可以，我们聊聊后续的更新计划。',
    read: false,
    createdAt: formatDateTime(getDateDaysAgo(0)),
  },
  {
    id: generateId(),
    senderId: 'editor-2',
    senderName: getUserName('editor-2'),
    senderRole: getUserRole('editor-2'),
    receiverId: 'author-9',
    receiverName: getUserName('author-9'),
    workId: 'work-9',
    workTitle: '锦绣山河',
    content: '您好，注意到《锦绣山河》近日更新节奏有所放缓，目前存稿 1 章。建议合理安排时间，如有困难随时沟通~',
    templateType: 'reminder',
    read: true,
    createdAt: formatDateTime(getDateDaysAgo(5)),
  },
  {
    id: generateId(),
    senderId: 'editor-1',
    senderName: getUserName('editor-1'),
    senderRole: getUserRole('editor-1'),
    receiverId: 'author-10',
    receiverName: getUserName('author-10'),
    workId: 'work-10',
    workTitle: '烟雨江南',
    content: '关于《烟雨江南》的后续更新计划，想和您约个时间沟通一下。请问您本周什么时间段方便呢？',
    templateType: 'appointment',
    read: false,
    createdAt: formatDateTime(getDateDaysAgo(1)),
  },
];

export function getWorkCoverColor(index: number): string {
  return coverColors[index % coverColors.length];
}

export function getWorkById(id: string): Work | undefined {
  return works.find(w => w.id === id);
}

export function getDailyStatusesByWorkId(workId: string): DailyStatus[] {
  return dailyStatuses.filter(s => s.workId === workId).sort((a, b) => a.date.localeCompare(b.date));
}

export function getAuthorById(id: string): User | undefined {
  return users.find(u => u.id === id);
}

export function getMessagesByUserId(userId: string): Message[] {
  return messages.filter(m => m.senderId === userId || m.receiverId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUnreadMessageCount(userId: string): number {
  return messages.filter(m => m.receiverId === userId && !m.read).length;
}
