export type RiskLevel = 'green' | 'yellow' | 'red';
export type UpdateStatus = 'pending' | 'published' | 'delayed';
export type FollowupStatus = 'untreated' | 'reminded' | 'appointed' | 'resolved';
export type RiskReasonType = 'delayed_today' | 'low_draft' | 'word_decline' | 'on_leave';

export interface RiskReason {
  type: RiskReasonType;
  label: string;
  description: string;
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
