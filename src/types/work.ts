export type RiskLevel = 'green' | 'yellow' | 'red';
export type UpdateStatus = 'pending' | 'published' | 'delayed';
export type FollowupStatus = 'untreated' | 'reminded' | 'appointed' | 'resolved';
export type RiskReasonType = 'delayed_today' | 'low_draft' | 'word_decline' | 'on_leave';
export type FollowupActionType = 'status_change' | 'message_sent' | 'risk_resolved' | 'note';

export interface RiskReason {
  type: RiskReasonType;
  label: string;
  description: string;
}

export interface FollowupHistory {
  id: string;
  workId: string;
  operatorId: string;
  operatorName: string;
  operatorRole: 'author' | 'editor';
  actionType: FollowupActionType;
  oldStatus?: FollowupStatus;
  newStatus?: FollowupStatus;
  messageType?: string;
  note?: string;
  resolution?: string;
  createdAt: string;
}

export interface Work {
  id: string;
  title: string;
  cover: string;
  authorId: string;
  editorId: string;
  authorName: string;
  category: string;
  totalWords: number;
  status: 'ongoing' | 'completed';
  riskLevel: RiskLevel;
  riskReasons: RiskReason[];
  followupStatus: FollowupStatus;
  resolutionNote?: string;
  resolvedAt?: string;
}

export interface DailyStatus {
  id: string;
  workId: string;
  date: string;
  wordCount: number;
  draftCount: number;
  updateStatus: UpdateStatus;
  publishTime?: string;
  onLeave: boolean;
  leaveReason?: string;
  createdAt: string;
}
