import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Search,
  Filter,
  Clock,
  FileText,
  AlertCircle,
  ChevronDown,
  Bell,
  CalendarCheck,
  CheckCircle,
  AlertTriangle,
  X,
  Edit3,
  CheckSquare,
} from 'lucide-react';
import type { Work, FollowupStatus } from '../types/work';
import { useWorkStore } from '../store/useWorkStore';
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
import { cn } from '../lib/utils';

const followupFilters = [
  { value: 'all', label: '全部跟进' },
  { value: 'untreated', label: '未处理' },
  { value: 'reminded', label: '已提醒' },
  { value: 'appointed', label: '已预约' },
  { value: 'resolved', label: '已解决' },
];

const riskFilters = [
  { value: 'all', label: '全部风险' },
  { value: 'red', label: '红色风险' },
  { value: 'yellow', label: '黄色预警' },
  { value: 'green', label: '绿色稳定' },
];

const resolvedFilters = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待处理' },
  { value: 'resolved', label: '已解决' },
];

const followupOptions: { value: FollowupStatus; label: string; icon: typeof Clock }[] = [
  { value: 'untreated', label: '未处理', icon: Clock },
  { value: 'reminded', label: '已提醒', icon: Bell },
  { value: 'appointed', label: '已预约', icon: CalendarCheck },
  { value: 'resolved', label: '已解决', icon: CheckCircle },
];

function FollowupSelect({
  work,
  onChange,
  onResolve,
}: {
  work: Work;
  onChange: (workId: string, status: FollowupStatus) => void;
  onResolve: (workId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (status: FollowupStatus) => {
    if (status === 'resolved') {
      onResolve(work.id);
    } else {
      onChange(work.id, status);
    }
    setIsOpen(false);
  };

  return (
    <div
      className="relative inline-block"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
          getFollowupColor(work.followupStatus),
          'hover:ring-2 hover:ring-offset-1 hover:ring-stone-300'
        )}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full', getFollowupDotColor(work.followupStatus))} />
        {getFollowupLabel(work.followupStatus)}
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-stone-200 overflow-hidden z-20 min-w-[120px]">
          {followupOptions.map((option) => {
            const Icon = option.icon;
            const isActive = work.followupStatus === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors',
                  isActive ? 'bg-stone-50 text-stone-800 font-medium' : 'text-stone-600 hover:bg-stone-50'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ResolveModal({
  workId,
  workTitle,
  onClose,
  onConfirm,
}: {
  workId: string;
  workTitle: string;
  onClose: () => void;
  onConfirm: (workId: string, resolution: string) => void;
}) {
  const [resolution, setResolution] = useState('');

  const handleConfirm = () => {
    if (!resolution.trim()) return;
    onConfirm(workId, resolution.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <h3 className="text-xl font-bold text-stone-800">标记风险已解决</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-stone-600">
            正在处理作品：<span className="font-semibold text-stone-800">《{workTitle}》</span>
          </p>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              处理结果说明 <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Edit3 className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
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
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors font-medium"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!resolution.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <CheckCircle className="w-4 h-4 inline mr-2" />
            确认解决
          </button>
        </div>
      </div>
    </div>
  );
}

export function WorkTable() {
  const navigate = useNavigate();
  const {
    getFilteredWorks,
    searchQuery,
    filterRisk,
    filterFollowup,
    filterResolved,
    setSearchQuery,
    setFilterRisk,
    setFilterFollowup,
    setFilterResolved,
    getDailyStatuses,
    updateFollowupStatus,
    resolveRisk,
  } = useWorkStore();

  const [resolveWork, setResolveWork] = useState<Work | null>(null);

  const works = getFilteredWorks();

  const getLatestStatus = (work: Work) => {
    const statuses = getDailyStatuses(work.id);
    return statuses[statuses.length - 1];
  };

  const handleFollowupChange = (workId: string, status: FollowupStatus) => {
    updateFollowupStatus(workId, status);
  };

  const handleResolveClick = (workId: string) => {
    const work = works.find(w => w.id === workId);
    if (work) {
      setResolveWork(work);
    }
  };

  const handleResolveConfirm = (workId: string, resolution: string) => {
    resolveRisk(workId, resolution);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-6 border-b border-stone-100">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h2 className="text-xl font-bold text-stone-800">作品列表</h2>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="搜索作品或作者..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full sm:w-72 rounded-lg border border-stone-200 focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-stone-400" />
              <span className="text-sm text-stone-500">风险等级：</span>
              <div className="flex rounded-lg border border-stone-200 overflow-hidden">
                {riskFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setFilterRisk(filter.value)}
                    className={cn(
                      'px-3 py-2 text-xs font-medium transition-all',
                      filterRisk === filter.value
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
              <Filter className="w-4 h-4 text-stone-400" />
              <span className="text-sm text-stone-500">跟进状态：</span>
              <div className="flex rounded-lg border border-stone-200 overflow-hidden">
                {followupFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setFilterFollowup(filter.value)}
                    className={cn(
                      'px-3 py-2 text-xs font-medium transition-all',
                      filterFollowup === filter.value
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
              <CheckSquare className="w-4 h-4 text-stone-400" />
              <span className="text-sm text-stone-500">处理状态：</span>
              <div className="flex rounded-lg border border-stone-200 overflow-hidden">
                {resolvedFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setFilterResolved(filter.value)}
                    className={cn(
                      'px-3 py-2 text-xs font-medium transition-all',
                      filterResolved === filter.value
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
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-stone-50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                作品
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                分类
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                风险等级
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                风险原因
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                跟进状态
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                存稿数量
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                今日状态
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {works.map((work, index) => {
              const latestStatus = getLatestStatus(work);
              const coverColor = getWorkCoverColor(index);
              const isResolved = work.followupStatus === 'resolved';

              return (
                <tr
                  key={work.id}
                  className={cn(
                    'hover:bg-stone-50 transition-colors cursor-pointer group',
                    isResolved && 'opacity-70 bg-emerald-50/30'
                  )}
                  onClick={() => navigate(`/work/${work.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'w-14 h-20 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0 overflow-hidden relative',
                          coverColor
                        )}
                      >
                        <span className="text-white/80 text-2xl font-bold" style={{ fontFamily: "'Source Han Serif SC', serif" }}>
                          {work.title.charAt(0)}
                        </span>
                        {isResolved && (
                          <div className="absolute top-1 right-1">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className={cn(
                          'font-semibold group-hover:text-[#1e3a5f] transition-colors',
                          isResolved ? 'text-stone-600 line-through decoration-stone-400/50' : 'text-stone-800'
                        )}>
                          {work.title}
                        </p>
                        <p className="text-sm text-stone-500">{work.authorName}</p>
                        {isResolved && work.resolutionNote && (
                          <p className="text-xs text-emerald-600 mt-0.5">
                            ✓ {work.resolutionNote}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700">
                      {work.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'w-3 h-3 rounded-full',
                          isResolved ? 'bg-stone-400' : getRiskColor(work.riskLevel)
                        )}
                      />
                      <span
                        className={cn(
                          'font-medium',
                          isResolved ? 'text-stone-500 line-through decoration-stone-400/50' : getRiskTextColor(work.riskLevel)
                        )}
                      >
                        {isResolved ? '已解决' : getRiskLabel(work.riskLevel)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {work.riskReasons.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                        {work.riskReasons.slice(0, 2).map((reason, idx) => (
                          <span
                            key={idx}
                            className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
                              isResolved ? 'bg-stone-100 text-stone-500' : 'bg-stone-100 text-stone-600'
                            )}
                            title={reason.description}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            {reason.label}
                          </span>
                        ))}
                        {work.riskReasons.length > 2 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-stone-100 text-stone-500">
                            +{work.riskReasons.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-emerald-600 inline-flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        状态良好
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <FollowupSelect
                      work={work}
                      onChange={handleFollowupChange}
                      onResolve={handleResolveClick}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className={cn(
                        'w-4 h-4',
                        isResolved ? 'text-stone-400' : 'text-stone-400'
                      )} />
                      <span
                        className={cn(
                          'font-semibold',
                          latestStatus && latestStatus.draftCount < 3
                            ? isResolved ? 'text-stone-500' : 'text-rose-600'
                            : isResolved ? 'text-stone-500' : 'text-stone-700'
                        )}
                      >
                        {latestStatus?.draftCount || 0} 章
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {latestStatus ? (
                      <div className="flex items-center gap-2">
                        {latestStatus.updateStatus === 'delayed' ? (
                          <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                            isResolved ? 'bg-stone-100 text-stone-500' : cn(getRiskBgColor(work.riskLevel), getRiskTextColor(work.riskLevel))
                          )}>
                            <AlertCircle className="w-3 h-3" />
                            更新延迟
                          </span>
                        ) : latestStatus.updateStatus === 'pending' ? (
                          <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                            isResolved ? 'bg-stone-100 text-stone-500' : 'bg-amber-50 text-amber-700'
                          )}>
                            <Clock className="w-3 h-3" />
                            待发布
                          </span>
                        ) : (
                          <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                            isResolved ? 'bg-stone-100 text-stone-500' : 'bg-emerald-50 text-emerald-700'
                          )}>
                            已发布
                            {latestStatus.publishTime && (
                              <span className={cn('ml-0.5', isResolved ? 'text-stone-500' : 'text-emerald-600/70')}>
                                {latestStatus.publishTime}
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-stone-400">暂无数据</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center gap-1 text-[#1e3a5f] font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      查看详情
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {works.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-stone-500">暂无匹配的作品</p>
        </div>
      )}

      {resolveWork && (
        <ResolveModal
          workId={resolveWork.id}
          workTitle={resolveWork.title}
          onClose={() => setResolveWork(null)}
          onConfirm={handleResolveConfirm}
        />
      )}
    </div>
  );
}
