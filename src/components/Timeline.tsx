import {
  CheckCircle2,
  Clock,
  AlertCircle,
  CalendarX,
} from 'lucide-react';
import type { DailyStatus } from '../types/work';
import { getDayOfWeek } from '../utils/dateUtils';
import { cn } from '../lib/utils';

interface TimelineProps {
  statuses: DailyStatus[];
}

const statusConfig = {
  published: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-100',
    label: '已发布',
  },
  pending: {
    icon: Clock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100',
    label: '待发布',
  },
  delayed: {
    icon: AlertCircle,
    color: 'text-rose-500',
    bgColor: 'bg-rose-100',
    label: '更新延迟',
  },
};

export function Timeline({ statuses }: TimelineProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-stone-800">发布时间线</h3>
        <p className="text-sm text-stone-500 mt-1">最近七天实际发布时间记录</p>
      </div>

      <div className="space-y-4">
        {statuses.map((status, index) => {
          const config = statusConfig[status.updateStatus];
          const Icon = config.icon;
          const isLast = index === statuses.length - 1;

          return (
            <div key={status.id} className="relative flex gap-4">
              {!isLast && (
                <div className="absolute left-5 top-10 bottom-0 w-px bg-stone-200" />
              )}

              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                  config.bgColor
                )}
              >
                <Icon className={cn('w-5 h-5', config.color)} />
              </div>

              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-800">
                        {getDayOfWeek(new Date(status.date))}
                      </span>
                      <span className="text-stone-400 text-sm">
                        {status.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                          config.bgColor,
                          config.color
                        )}
                      >
                        {config.label}
                      </span>
                      {status.publishTime && (
                        <span className="text-sm text-stone-500">
                          发布时间 {status.publishTime}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#1e3a5f]">
                      {status.wordCount.toLocaleString()} 字
                    </p>
                    <p className="text-sm text-amber-600">
                      存稿 {status.draftCount} 章
                    </p>
                  </div>
                </div>

                {status.onLeave && status.leaveReason && (
                  <div className="mt-3 bg-stone-50 rounded-lg p-3 border border-stone-200">
                    <div className="flex items-start gap-2">
                      <CalendarX className="w-4 h-4 text-stone-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-stone-600">
                        请假说明：{status.leaveReason}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
