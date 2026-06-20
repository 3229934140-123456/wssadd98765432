export type RiskLevel = 'green' | 'yellow' | 'red';
export type UpdateStatus = 'pending' | 'published' | 'delayed';

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
