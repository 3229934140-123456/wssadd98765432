import { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  CalendarX,
  Send,
  Check,
  Loader2,
} from 'lucide-react';
import type { UpdateStatus } from '../types/work';
import { cn } from '../lib/utils';

interface StatusFormProps {
  workTitle: string;
  onSubmit: (data: {
    wordCount: number;
    draftCount: number;
    updateStatus: UpdateStatus;
    onLeave: boolean;
    leaveReason?: string;
  }) => void;
}

interface StatusOption {
  value: UpdateStatus;
  label: string;
  description: string;
  icon: typeof Clock;
  color: string;
}

const statusOptions: StatusOption[] = [
  {
    value: 'published',
    label: '已发布',
    description: '今天的章节已经准时发布',
    icon: CheckCircle,
    color: 'emerald',
  },
  {
    value: 'pending',
    label: '待发布',
    description: '正在创作中，预计今天内发布',
    icon: Clock,
    color: 'amber',
  },
  {
    value: 'delayed',
    label: '可能延迟',
    description: '今天可能无法按时更新',
    icon: AlertCircle,
    color: 'rose',
  },
];

export function StatusForm({ workTitle, onSubmit }: StatusFormProps) {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('published');
  const [wordCount, setWordCount] = useState('4000');
  const [draftCount, setDraftCount] = useState('3');
  const [onLeave, setOnLeave] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    onSubmit({
      wordCount: parseInt(wordCount) || 0,
      draftCount: parseInt(draftCount) || 0,
      updateStatus,
      onLeave,
      leaveReason: onLeave ? leaveReason : undefined,
    });
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors: Record<string, { active: string; inactive: string }> = {
      emerald: {
        active: 'border-emerald-400 bg-emerald-50',
        inactive: 'border-stone-200 hover:border-emerald-300',
      },
      amber: {
        active: 'border-amber-400 bg-amber-50',
        inactive: 'border-stone-200 hover:border-amber-300',
      },
      rose: {
        active: 'border-rose-400 bg-rose-50',
        inactive: 'border-stone-200 hover:border-rose-300',
      },
    };
    return isActive ? colors[color].active : colors[color].inactive;
  };

  const getIconColor = (color: string, isActive: boolean) => {
    const colors: Record<string, string> = {
      emerald: isActive ? 'text-emerald-500' : 'text-stone-400',
      amber: isActive ? 'text-amber-500' : 'text-stone-400',
      rose: isActive ? 'text-rose-500' : 'text-stone-400',
    };
    return colors[color];
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-6 border-b border-stone-100 bg-gradient-to-r from-[#1e3a5f]/5 to-transparent">
        <h2 className="text-xl font-bold text-stone-800">
          今日状态填报
        </h2>
        <p className="text-stone-500 mt-1">
          作品：<span className="font-medium text-[#1e3a5f]">{workTitle}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-4">
            今日更新状态
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isActive = updateStatus === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setUpdateStatus(option.value)}
                  className={cn(
                    'relative p-5 rounded-xl border-2 transition-all text-left',
                    getColorClasses(option.color, isActive)
                  )}
                >
                  <div className="flex items-start gap-4">
                    <Icon
                      className={cn(
                        'w-8 h-8 flex-shrink-0',
                        getIconColor(option.color, isActive)
                      )}
                    />
                    <div>
                      <p className={cn(
                        'font-bold',
                        isActive ? 'text-stone-800' : 'text-stone-600'
                      )}>
                        {option.label}
                      </p>
                      <p className="text-sm text-stone-500 mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#1e3a5f] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-3">
              <FileText className="w-4 h-4 inline mr-2 text-stone-400" />
              今日码字数量
            </label>
            <div className="relative">
              <input
                type="number"
                value={wordCount}
                onChange={(e) => setWordCount(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border border-stone-200 focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10 outline-none transition-all text-lg font-semibold"
                placeholder="输入字数"
                min="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">
                字
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-3">
              <FileText className="w-4 h-4 inline mr-2 text-amber-500" />
              当前存稿数量
            </label>
            <div className="relative">
              <input
                type="number"
                value={draftCount}
                onChange={(e) => setDraftCount(e.target.value)}
                className={cn(
                  'w-full px-4 py-4 rounded-xl border focus:ring-2 outline-none transition-all text-lg font-semibold',
                  parseInt(draftCount) < 3
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                    : 'border-stone-200 focus:border-[#1e3a5f] focus:ring-[#1e3a5f]/10'
                )}
                placeholder="输入章节数"
                min="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">
                章
              </span>
            </div>
            {parseInt(draftCount) < 3 && (
              <p className="text-sm text-rose-500 mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                存稿不足3章，请注意及时补充
              </p>
            )}
          </div>
        </div>

        <div className="bg-stone-50 rounded-xl p-5 border border-stone-200">
          <label className="flex items-start gap-4 cursor-pointer">
            <input
              type="checkbox"
              checked={onLeave}
              onChange={(e) => setOnLeave(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-stone-300 text-[#1e3a5f] focus:ring-[#1e3a5f]"
            />
            <div>
              <div className="flex items-center gap-2">
                <CalendarX className="w-5 h-5 text-stone-500" />
                <span className="font-semibold text-stone-700">本周可能请假</span>
              </div>
              <p className="text-sm text-stone-500 mt-1">
                如果本周有请假计划，请勾选并说明原因
              </p>
            </div>
          </label>

          {onLeave && (
            <div className="mt-4 pl-9">
              <textarea
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="请说明请假原因和预计时间..."
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10 outline-none resize-none h-24 text-sm"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || submitted}
          className={cn(
            'w-full py-4 rounded-xl font-bold text-white transition-all text-lg',
            'bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] hover:from-[#2d4a6f] hover:to-[#1e3a5f]',
            'shadow-lg shadow-[#1e3a5f]/20 hover:shadow-[#1e3a5f]/30',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'flex items-center justify-center gap-2'
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              提交中...
            </>
          ) : submitted ? (
            <>
              <Check className="w-5 h-5" />
              提交成功
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              提交今日状态
            </>
          )}
        </button>
      </form>
    </div>
  );
}
