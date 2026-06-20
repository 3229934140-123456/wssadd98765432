import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { RiskLevel } from '../types/work';
import { cn } from '../lib/utils';

interface RiskCardProps {
  level: RiskLevel;
  count: number;
  label: string;
}

const riskConfig: Record<RiskLevel, {
  icon: typeof CheckCircle;
  gradient: string;
  textColor: string;
  bgPattern: string;
}> = {
  green: {
    icon: CheckCircle,
    gradient: 'from-emerald-500 to-emerald-600',
    textColor: 'text-emerald-600',
    bgPattern: 'bg-emerald-50',
  },
  yellow: {
    icon: AlertTriangle,
    gradient: 'from-amber-500 to-amber-600',
    textColor: 'text-amber-600',
    bgPattern: 'bg-amber-50',
  },
  red: {
    icon: XCircle,
    gradient: 'from-rose-500 to-rose-600',
    textColor: 'text-rose-600',
    bgPattern: 'bg-rose-50',
  },
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{display}</span>;
}

export function RiskCard({ level, count, label }: RiskCardProps) {
  const config = riskConfig[level];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl p-6 transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-1',
        'bg-white border border-stone-200'
      )}
      style={{ animation: 'fadeInUp 0.6s ease-out' }}
    >
      <div
        className={cn(
          'absolute inset-0 opacity-50 bg-gradient-to-br',
          config.gradient
        )}
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 30%, 0 60%)',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              'bg-gradient-to-br',
              config.gradient,
              'shadow-lg'
            )}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <span
            className={cn(
              'text-4xl font-bold',
              config.textColor
            )}
          >
            <AnimatedNumber value={count} />
          </span>
        </div>

        <p className="text-stone-600 font-medium text-lg">{label}</p>
        <p className="text-stone-400 text-sm mt-1">部作品</p>
      </div>
    </div>
  );
}
