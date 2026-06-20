import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import type { DailyStatus } from '../types/work';
import { getDayOfWeek } from '../utils/dateUtils';

interface WordChartProps {
  statuses: DailyStatus[];
}

export function WordChart({ statuses }: WordChartProps) {
  const chartData = statuses.map((status) => ({
    date: status.date.slice(5),
    day: getDayOfWeek(new Date(status.date)),
    wordCount: status.wordCount,
    draftCount: status.draftCount,
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { day: string; date: string; wordCount: number; draftCount: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-stone-200">
          <p className="font-semibold text-stone-800">{data.day} {data.date}</p>
          <p className="text-[#1e3a5f]">
            码字：<span className="font-bold">{data.wordCount.toLocaleString()}</span> 字
          </p>
          <p className="text-amber-600">
            存稿：<span className="font-bold">{data.draftCount}</span> 章
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-stone-800">七日码字曲线</h3>
          <p className="text-sm text-stone-500 mt-1">最近七天每日码字数量统计</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#1e3a5f]" />
            <span className="text-stone-600">码字数量</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-stone-600">存稿数量</span>
          </div>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: '#78716c', fontSize: 12 }}
              axisLine={{ stroke: '#d6d3d1' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#78716c', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="wordCount"
              stroke="#1e3a5f"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorWords)"
              dot={{ fill: '#1e3a5f', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 8, fill: '#1e3a5f' }}
            />
            <Line
              type="monotone"
              dataKey="draftCount"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#f59e0b' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
