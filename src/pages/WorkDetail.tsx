import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Tag,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  Clock,
  Calendar,
  Bell,
  Lightbulb,
  CalendarCheck,
} from 'lucide-react';
import { useWorkStore } from '../store/useWorkStore';
import { useMessageStore } from '../store/useMessageStore';
import { useUserStore } from '../store/useUserStore';
import { WordChart } from '../components/WordChart';
import { Timeline } from '../components/Timeline';
import { MessageTemplateCard } from '../components/MessageTemplateCard';
import {
  getRiskLabel,
  getRiskColor,
  getRiskTextColor,
  getRiskBgColor,
  getFollowupLabel,
  getFollowupColor,
  getFollowupDotColor,
} from '../utils/riskCalculator';
import { getWorkCoverColor } from '../utils/mockData';
import { getAuthorById } from '../utils/mockData';
import type { MessageType } from '../types/message';
import type { FollowupStatus, RiskReasonType } from '../types/work';
import { cn } from '../lib/utils';

const riskIconMap: Record<RiskReasonType, typeof AlertTriangle> = {
  delayed_today: XCircle,
  low_draft: FileText,
  word_decline: TrendingUp,
  on_leave: Calendar,
};

const riskColorMap: Record<RiskReasonType, string> = {
  delayed_today: 'text-rose-500 bg-rose-50',
  low_draft: 'text-amber-500 bg-amber-50',
  word_decline: 'text-blue-500 bg-blue-50',
  on_leave: 'text-purple-500 bg-purple-50',
};

const followupStatuses: { value: FollowupStatus; label: string; icon: typeof Clock }[] = [
  { value: 'untreated', label: '未处理', icon: Clock },
  { value: 'reminded', label: '已提醒', icon: Bell },
  { value: 'appointed', label: '已预约', icon: CalendarCheck },
  { value: 'resolved', label: '已解决', icon: CheckCircle },
];

export function WorkDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getWorkById, getDailyStatuses, updateFollowupStatus } = useWorkStore();
  const { messageTemplates, sendMessage } = useMessageStore();
  const { currentUser } = useUserStore();

  const [showFollowupDropdown, setShowFollowupDropdown] = useState(false);

  const work = id ? getWorkById(id) : undefined;
  const statuses = id ? getDailyStatuses(id) : [];
  const workIndex = id ? parseInt(id.replace('work-', '')) - 1 : 0;
  const coverColor = getWorkCoverColor(workIndex);

  const author = work ? getAuthorById(work.authorId) : undefined;
  const latestStatus = statuses[statuses.length - 1];

  const handleSendMessage = (type: MessageType, content: string) => {
    if (!work || !currentUser || !author) return;
    sendMessage({
      senderId: currentUser.id,
      receiverId: author.id,
      workId: work.id,
      workTitle: work.title,
      type,
      content,
      template: type,
    });

    if (type === 'reminder' || type === 'suggestion') {
      updateFollowupStatus(work.id, 'reminded');
    } else if (type === 'appointment') {
      updateFollowupStatus(work.id, 'appointed');
    }
  };

  const handleChangeFollowup = (status: FollowupStatus) => {
    if (work) {
      updateFollowupStatus(work.id, status);
    }
    setShowFollowupDropdown(false);
  };

  if (!work) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-500">作品不存在</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-6 py-2 bg-[#1e3a5f] text-white rounded-lg"
        >
          返回看板
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回看板
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="relative h-40 bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f]">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400 rounded-full blur-3xl" />
          </div>
        </div>

        <div className="px-8 pb-8 -mt-16 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div
              className={cn(
                'w-32 h-44 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-xl border-4 border-white flex-shrink-0',
                coverColor
              )}
            >
              <span
                className="text-white/90 text-5xl font-bold"
                style={{ fontFamily: "'Source Han Serif SC', serif" }}
              >
                {work.title.charAt(0)}
              </span>
            </div>

            <div className="flex-1 pt-4 w-full">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium',
                    getRiskBgColor(work.riskLevel),
                    getRiskTextColor(work.riskLevel)
                  )}
                >
                  <span className={cn('w-2 h-2 rounded-full', getRiskColor(work.riskLevel))} />
                  {getRiskLabel(work.riskLevel)}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-stone-100 text-stone-700">
                  <Tag className="w-3.5 h-3.5" />
                  {work.category}
                </span>

                <div className="relative">
                  <button
                    onClick={() => setShowFollowupDropdown(!showFollowupDropdown)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium',
                      getFollowupColor(work.followupStatus)
                    )}
                  >
                    <span className={cn('w-2 h-2 rounded-full', getFollowupDotColor(work.followupStatus))} />
                    {getFollowupLabel(work.followupStatus)}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {showFollowupDropdown && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden z-10 min-w-[140px]">
                      {followupStatuses.map((status) => {
                        const Icon = status.icon;
                        const isActive = work.followupStatus === status.value;
                        return (
                          <button
                            key={status.value}
                            onClick={() => handleChangeFollowup(status.value)}
                            className={cn(
                              'w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors',
                              isActive ? 'bg-stone-50 text-stone-800 font-medium' : 'text-stone-600 hover:bg-stone-50'
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            {status.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <h1
                className="text-3xl font-bold text-stone-800 mb-2"
                style={{ fontFamily: "'Source Han Serif SC', serif" }}
              >
                {work.title}
              </h1>

              <div className="flex flex-wrap gap-6 text-stone-600">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-stone-400" />
                  <span>作者：{work.authorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-stone-400" />
                  <span>总字数：{(work.totalWords / 10000).toFixed(1)} 万</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-stone-400" />
                  <span>
                    状态：
                    <span className={work.status === 'ongoing' ? 'text-emerald-600 font-medium' : 'text-stone-500'}>
                      {work.status === 'ongoing' ? '连载中' : '已完结'}
                    </span>
                  </span>
                </div>
                {latestStatus && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span>
                      当前存稿：
                      <span className={latestStatus.draftCount < 3 ? 'text-rose-600 font-medium' : 'text-amber-600 font-medium'}>
                        {latestStatus.draftCount} 章
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {work.riskReasons.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-stone-800">风险原因分析</h3>
            <span className="text-sm text-stone-500">共 {work.riskReasons.length} 项需要关注</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {work.riskReasons.map((reason, index) => {
              const Icon = riskIconMap[reason.type] || AlertTriangle;
              return (
                <div
                  key={index}
                  className="p-5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', riskColorMap[reason.type])}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-800">{reason.label}</p>
                      <p className="text-sm text-stone-500 mt-1 leading-relaxed">{reason.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WordChart statuses={statuses} />
        <Timeline statuses={statuses} />
      </div>

      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-stone-800">发送消息</h2>
          <p className="text-stone-500 mt-1">
            选择合适的消息模板，与作者进行沟通
            <Lightbulb className="w-4 h-4 inline ml-2 text-amber-500" />
            发送消息后会自动更新跟进状态
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {messageTemplates.map((template) => (
            <MessageTemplateCard
              key={template.type}
              template={template}
              workTitle={work.title}
              draftCount={latestStatus?.draftCount || 0}
              onSend={handleSendMessage}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
