import { useMemo } from 'react';
import { useWorkStore } from '../store/useWorkStore';
import { RiskCard } from '../components/RiskCard';
import { WorkTable } from '../components/WorkTable';
import { CheckCircle, Archive, AlertOctagon } from 'lucide-react';

export function Dashboard() {
  const { works } = useWorkStore();

  const stats = useMemo(() => {
    const pendingRed = works.filter(w => w.riskLevel === 'red' && w.followupStatus !== 'resolved').length;
    const pendingYellow = works.filter(w => w.riskLevel === 'yellow' && w.followupStatus !== 'resolved').length;
    const resolvedRed = works.filter(w => w.riskLevel === 'red' && w.followupStatus === 'resolved').length;
    const resolvedYellow = works.filter(w => w.riskLevel === 'yellow' && w.followupStatus === 'resolved').length;
    const green = works.filter(w => w.riskLevel === 'green').length;
    const totalResolved = resolvedRed + resolvedYellow;
    const totalPending = pendingRed + pendingYellow;

    return {
      pendingRed,
      pendingYellow,
      resolvedRed,
      resolvedYellow,
      green,
      totalResolved,
      totalPending,
    };
  }, [works]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-stone-800" style={{ fontFamily: "'Source Han Serif SC', serif" }}>
          作品看板
        </h1>
        <p className="text-stone-500 mt-2">实时监控所有连载作品的更新状态和风险等级</p>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertOctagon className="w-5 h-5 text-rose-500" />
          <h2 className="text-lg font-semibold text-stone-800">待处理风险</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 font-medium">
            {stats.totalPending} 部
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RiskCard
            level="red"
            count={stats.pendingRed}
            label="红色风险（待处理）"
            subLabel="今日预计无法准时发布"
          />
          <RiskCard
            level="yellow"
            count={stats.pendingYellow}
            label="黄色预警（待处理）"
            subLabel="存稿不足或字数下滑"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-stone-800">稳定运行</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <RiskCard
            level="green"
            count={stats.green}
            label="绿色稳定"
            subLabel="更新节奏正常，存稿充足"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Archive className="w-5 h-5 text-stone-400" />
          <h2 className="text-lg font-semibold text-stone-800">已归档历史风险</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
            {stats.totalResolved} 部
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RiskCard
            level="red"
            count={stats.resolvedRed}
            label="红色风险（已解决）"
            subLabel="曾经的高风险，现已解决"
            archived
          />
          <RiskCard
            level="yellow"
            count={stats.resolvedYellow}
            label="黄色预警（已解决）"
            subLabel="曾经的预警，现已处理"
            archived
          />
        </div>
      </div>

      <WorkTable />
    </div>
  );
}
