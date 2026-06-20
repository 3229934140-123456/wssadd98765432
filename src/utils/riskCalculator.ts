import type { DailyStatus, RiskLevel } from '../types/work';

export function calculateRiskLevel(statuses: DailyStatus[]): RiskLevel {
  if (statuses.length === 0) return 'green';

  const today = statuses[statuses.length - 1];

  if (today && today.updateStatus === 'delayed') {
    return 'red';
  }

  if (today && today.draftCount < 3) {
    return 'yellow';
  }

  if (statuses.length >= 3) {
    const recent = statuses.slice(-3);
    const isDeclining = recent.every((s, i) =>
      i === 0 || s.wordCount < recent[i - 1].wordCount
    );
    if (isDeclining && recent[0].wordCount > 0) {
      return 'yellow';
    }
  }

  return 'green';
}

export function getRiskLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    green: '更新稳定',
    yellow: '需要关注',
    red: '更新风险',
  };
  return labels[level];
}

export function getRiskColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-rose-500',
  };
  return colors[level];
}

export function getRiskTextColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    green: 'text-emerald-600',
    yellow: 'text-amber-600',
    red: 'text-rose-600',
  };
  return colors[level];
}

export function getRiskBgColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    green: 'bg-emerald-50',
    yellow: 'bg-amber-50',
    red: 'bg-rose-50',
  };
  return colors[level];
}
