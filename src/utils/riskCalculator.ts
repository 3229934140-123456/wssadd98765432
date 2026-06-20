import type { DailyStatus, RiskLevel, RiskReason, FollowupStatus } from '../types/work';

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

export function calculateRiskReasons(statuses: DailyStatus[]): RiskReason[] {
  const reasons: RiskReason[] = [];
  if (statuses.length === 0) return reasons;

  const today = statuses[statuses.length - 1];

  if (today && today.updateStatus === 'delayed') {
    reasons.push({
      type: 'delayed_today',
      label: '今日更新延迟',
      description: '作者标记今日可能无法按时发布，需立即关注',
    });
  }

  if (today && today.draftCount < 3) {
    reasons.push({
      type: 'low_draft',
      label: `存稿不足（${today.draftCount}章）`,
      description: `当前存稿仅 ${today.draftCount} 章，低于安全线 3 章，建议尽快补充`,
    });
  }

  if (statuses.length >= 3) {
    const recent = statuses.slice(-3);
    const isDeclining = recent.every((s, i) =>
      i === 0 || s.wordCount < recent[i - 1].wordCount
    );
    if (isDeclining && recent[0].wordCount > 0) {
      const declineRate = recent[0].wordCount > 0
        ? Math.round((1 - recent[recent.length - 1].wordCount / recent[0].wordCount) * 100)
        : 0;
      reasons.push({
        type: 'word_decline',
        label: `连续三日字数下滑（↓${declineRate}%）`,
        description: `近三日码字数量持续下降，从 ${recent[0].wordCount.toLocaleString()} 字降至 ${recent[recent.length - 1].wordCount.toLocaleString()} 字`,
      });
    }
  }

  if (today && today.onLeave && today.leaveReason) {
    reasons.push({
      type: 'on_leave',
      label: '作者请假中',
      description: `请假说明：${today.leaveReason}`,
    });
  }

  return reasons;
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

export function getFollowupLabel(status: FollowupStatus): string {
  const labels: Record<FollowupStatus, string> = {
    untreated: '未处理',
    reminded: '已提醒',
    appointed: '已预约',
    resolved: '已解决',
  };
  return labels[status];
}

export function getFollowupColor(status: FollowupStatus): string {
  const colors: Record<FollowupStatus, string> = {
    untreated: 'bg-stone-100 text-stone-600',
    reminded: 'bg-blue-50 text-blue-600',
    appointed: 'bg-purple-50 text-purple-600',
    resolved: 'bg-emerald-50 text-emerald-600',
  };
  return colors[status];
}

export function getFollowupDotColor(status: FollowupStatus): string {
  const colors: Record<FollowupStatus, string> = {
    untreated: 'bg-stone-400',
    reminded: 'bg-blue-500',
    appointed: 'bg-purple-500',
    resolved: 'bg-emerald-500',
  };
  return colors[status];
}
