import { useWorkStore } from '../store/useWorkStore';
import { RiskCard } from '../components/RiskCard';
import { WorkTable } from '../components/WorkTable';

export function Dashboard() {
  const { works } = useWorkStore();

  const riskCounts = {
    red: works.filter(w => w.riskLevel === 'red').length,
    yellow: works.filter(w => w.riskLevel === 'yellow').length,
    green: works.filter(w => w.riskLevel === 'green').length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-stone-800" style={{ fontFamily: "'Source Han Serif SC', serif" }}>
          作品看板
        </h1>
        <p className="text-stone-500 mt-2">实时监控所有连载作品的更新状态和风险等级</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RiskCard level="red" count={riskCounts.red} label="红色风险" />
        <RiskCard level="yellow" count={riskCounts.yellow} label="黄色预警" />
        <RiskCard level="green" count={riskCounts.green} label="绿色稳定" />
      </div>

      <WorkTable />
    </div>
  );
}
