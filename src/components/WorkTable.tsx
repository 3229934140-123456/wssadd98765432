import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Search,
  Filter,
  Clock,
  FileText,
  AlertCircle,
} from 'lucide-react';
import type { Work } from '../types/work';
import { useWorkStore } from '../store/useWorkStore';
import { getRiskLabel, getRiskColor, getRiskTextColor, getRiskBgColor } from '../utils/riskCalculator';
import { getWorkCoverColor } from '../utils/mockData';
import { cn } from '../lib/utils';

export function WorkTable() {
  const navigate = useNavigate();
  const {
    getFilteredWorks,
    searchQuery,
    filterRisk,
    setSearchQuery,
    setFilterRisk,
    getDailyStatuses,
  } = useWorkStore();

  const works = getFilteredWorks();

  const getLatestStatus = (work: Work) => {
    const statuses = getDailyStatuses(work.id);
    return statuses[statuses.length - 1];
  };

  const riskFilters = [
    { value: 'all', label: '全部' },
    { value: 'red', label: '红色风险' },
    { value: 'yellow', label: '黄色预警' },
    { value: 'green', label: '绿色稳定' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-6 border-b border-stone-100">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-xl font-bold text-stone-800">作品列表</h2>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="搜索作品或作者..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full sm:w-64 rounded-lg border border-stone-200 focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10 outline-none transition-all text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-stone-400" />
              <div className="flex rounded-lg border border-stone-200 overflow-hidden">
                {riskFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setFilterRisk(filter.value)}
                    className={cn(
                      'px-4 py-2.5 text-sm font-medium transition-all',
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
                存稿数量
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                今日状态
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                总字数
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
                          </span>
                        )}
                        {latestStatus.publishTime && (
                          <span className="text-sm text-stone-500">
                            {latestStatus.publishTime}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-stone-400">暂无数据</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-stone-700">
                      {(work.totalWords / 10000).toFixed(1)} 万
                    </span>
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
