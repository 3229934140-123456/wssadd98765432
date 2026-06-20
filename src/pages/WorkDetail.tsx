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
  History,
  CheckSquare,
  X,
  Edit3,
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
import { getWorkCoverColor, messageTemplates } from '../utils/mockData';
import type { MessageTemplateType } from '../types/message';
import type { FollowupStatus, RiskReasonType, FollowupHistory, FollowupActionType } from '../types/work';
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

const actionTypeLabels: Record<FollowupActionType, string> = {
  status_change: '状态变更',
  message_sent: '发送消息',
  risk_resolved: '风险解决',
  note: '添加备注',
};

const actionTypeColors: Record<FollowupActionType, string> = {
  status_change: 'bg-blue-500',
  message_sent: 'bg-purple-500',
  risk_resolved: 'bg-emerald-500',
  note: 'bg-amber-500',
};

function FollowupHistoryItem({ history }: { history: FollowupHistory }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={cn('w-3 h-3 rounded-full flex-shrink-0', actionTypeColors[history.actionType])} />
        <div className="w-0.5 flex-1 bg-stone-200 mt-1" />
      </div>
      <div className="flex-1 pb-6">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-stone-800">{history.operatorName}</span>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            history.operatorRole === 'editor' ? 'bg-[#1e3a5f]/10 text-[#1e3a5f]' : 'bg-amber-100 text-amber-700'
          )}>
            {history.operatorRole === 'editor' ? '编辑' : '作者'}
          </span>
          <span className="text-xs text-stone-400">{actionTypeLabels[history.actionType]}</span>
        </div>
        {history.oldStatus && history.newStatus && (
          <p className="text-sm text-stone-600 mb-1">
            {getFollowupLabel(history.oldStatus)} → {getFollowupLabel(history.newStatus)}
          </p>
        )}
        {history.messageType && (
          <p className="text-sm text-stone-600 mb-1">
            发送了{history.messageType === 'reminder' ? '温和提醒' :
              history.messageType === 'suggestion' ? '补更建议' : '沟通预约'}消息
          </p>
        )}
        {history.note && (
          <p className="text-sm text-stone-600 mb-1">
            <span className="text-stone-500">备注：</span>{history.note}
          </p>
        )}
        {history.resolution && (
          <div className="mt-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <p className="text-sm text-emerald-700">
              <span className="font-medium">处理结果：</span>{history.resolution}
            </p>
          </div>
        )}
        <p className="text-xs text-stone-400 mt-2">{history.createdAt}</p>
      </div>
    </div>
  );
}

export function WorkDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getWorkById,
    getDailyStatuses,
    getFollowupHistories,
    updateFollowupStatus,
    resolveRisk,
  } = useWorkStore();
  const { sendTemplateMessage } = useMessageStore();
  const { currentUser } = useUserStore();

  const [showFollowupDropdown, setShowFollowupDropdown] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionText, setResolutionText] = useState('');

  const work = id ? getWorkById(id) : undefined;
  const statuses = id ? getDailyStatuses(id) : [];
  const histories = id ? getFollowupHistories(id) : [];
  const workIndex = id ? parseInt(id.replace('work-', '')) - 1 : 0;
  const coverColor = getWorkCoverColor(workIndex);

  const latestStatus = statuses[statuses.length - 1];

  const handleSendMessage = (type: MessageTemplateType) => {
    if (!work) return;
    sendTemplateMessage(work.id, type);
  };

  const handleChangeFollowup = (status: FollowupStatus) => {
    if (work) {
      if (status === 'resolved') {
        setShowResolveModal(true);
      } else {
        updateFollowupStatus(work.id, status);
      }
    }
    setShowFollowupDropdown(false);
  };

  const handleResolveRisk = () => {
    if (!work || !resolutionText.trim()) return;
    resolveRisk(work.id, resolutionText.trim());
    setShowResolveModal(false);
    setResolutionText('');
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

  const isEditor = currentUser?.role === 'editor';

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
        {isEditor && work.followupStatus !== 'resolved' && work.riskLevel !== 'green' && (
          <button
            onClick={() => setShowResolveModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
          >
            <CheckSquare className="w-5 h-5" />
            标记已解决
          </button>
        )}
        {work.followupStatus === 'resolved' && work.resolutionNote && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-5 h-5" />
            <div>
              <p className="text-sm font-medium">已解决</p>
              <p className="text-xs">{work.resolutionNote}</p>
            </div>
          </div>
        )}
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

                {isEditor && (
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
                )}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
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
                onSend={(type) => handleSendMessage(type)}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#1e3a5f]" />
              <h2 className="text-xl font-bold text-stone-800">跟进历史</h2>
            </div>
            <p className="text-stone-500 mt-1 text-sm">共 {histories.length} 条记录</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            {histories.length === 0 ? (
              <div className="text-center py-8 text-stone-400">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无跟进记录</p>
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto pr-2">
                {histories.map((history) => (
                  <FollowupHistoryItem key={history.id} history={history} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-stone-200">
              <h3 className="text-xl font-bold text-stone-800">标记风险已解决</h3>
              <button
                onClick={() => {
                  setShowResolveModal(false);
                  setResolutionText('');
                }}
                className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  处理结果说明 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Edit3 className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
                  <textarea
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    placeholder="请描述风险是如何解决的，例如：作者已恢复更新节奏，存稿恢复至5章..."
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] outline-none resize-none text-sm"
                  />
                </div>
                <p className="mt-2 text-xs text-stone-500">
                  填写后会自动记录到跟进历史中，跟进状态将改为「已解决」
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-stone-200 bg-stone-50 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowResolveModal(false);
                  setResolutionText('');
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleResolveRisk}
                disabled={!resolutionText.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <CheckCircle className="w-4 h-4 inline mr-2" />
                确认解决
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
