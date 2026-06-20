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

const followupOptions: { value: FollowupStatus; label: string; icon: typeof Clock }[] = [
  { value: 'untreated', label: '未处理', icon: Clock },
  { value: 'reminded', label: '已提醒', icon: Bell },
  { value: 'appointed', label: '已预约', icon: CalendarCheck },
  { value: 'resolved', label: '已解决', icon: CheckCircle },
];

function FollowupSelect({
  work,
  onChange,
}: {
  work: Work;
  onChange: (workId: string, status: FollowupStatus) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

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
                onClick={() => {
                  onChange(work.id, option.value);
                  setIsOpen(false);
                }}
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

export function WorkTable() {
  const navigate = useNavigate();
  const {
    getFilteredWorks,
    searchQuery,
    filterRisk,
    filterFollowup,
    setSearchQuery,
    setFilterRisk,
    setFilterFollowup,
    getDailyStatuses,
    updateFollowupStatus,
  } = useWorkStore();

  const works = getFilteredWorks();

  const getLatestStatus = (work: Work) => {
    const statuses = getDailyStatuses(work.id);
    return statuses[statuses.length - 1];
  };

  const handleFollowupChange = (workId: string, status: FollowupStatus) => {
    updateFollowupStatus(workId, status);
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

              return (
                <tr
                  key={work.id}
                  className="hover:bg-stone-50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/work/${work.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'w-14 h-20 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0 overflow-hidden',
                          coverColor
                        )}
                      >
                        <span className="text-white/80 text-2xl font-bold" style={{ fontFamily: "'Source Han Serif SC', serif" }}>
                          {work.title.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-stone-800 group-hover:text-[#1e3a5f] transition-colors">
                          {work.title}
                        </p>
                        <p className="text-sm text-stone-500">{work.authorName}</p>
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
                          getRiskColor(work.riskLevel)
                        )}
                      />
                      <span
                        className={cn(
                          'font-medium',
                          getRiskTextColor(work.riskLevel)
                        )}
                      >
                        {getRiskLabel(work.riskLevel)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {work.riskReasons.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                        {work.riskReasons.slice(0, 2).map((reason, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-stone-100 text-stone-600"
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
                    <FollowupSelect work={work} onChange={handleFollowupChange} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-stone-400" />
                      <span
                        className={cn(
                          'font-semibold',
                          latestStatus && latestStatus.draftCount < 3
                            ? 'text-rose-600'
                            : 'text-stone-700'
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
                          <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', getRiskBgColor(work.riskLevel), getRiskTextColor(work.riskLevel))}>
                            <AlertCircle className="w-3 h-3" />
                            更新延迟
                          </span>
                        ) : latestStatus.updateStatus === 'pending' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                            <Clock className="w-3 h-3" />
                            待发布
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                            已发布
                            {latestStatus.publishTime && (
                              <span className="text-emerald-600/70 ml-0.5">{latestStatus.publishTime}</span>
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
    </div>
  );
}
