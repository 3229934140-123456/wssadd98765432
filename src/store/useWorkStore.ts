import { create } from 'zustand';
import type { Work, DailyStatus, UpdateStatus, FollowupStatus } from '../types/work';
import { works, getDailyStatusesByWorkId } from '../utils/mockData';
import { calculateRiskLevel, calculateRiskReasons } from '../utils/riskCalculator';
import { formatDate, formatDateTime, formatTime } from '../utils/dateUtils';

interface WorkState {
  works: Work[];
  dailyStatuses: Record<string, DailyStatus[]>;
  searchQuery: string;
  filterRisk: string;
  filterFollowup: string;
  setSearchQuery: (query: string) => void;
  setFilterRisk: (risk: string) => void;
  setFilterFollowup: (followup: string) => void;
  getFilteredWorks: () => Work[];
  getWorkById: (id: string) => Work | undefined;
  getDailyStatuses: (workId: string) => DailyStatus[];
  updateFollowupStatus: (workId: string, status: FollowupStatus) => void;
  submitDailyStatus: (workId: string, data: {
    wordCount: number;
    draftCount: number;
    updateStatus: UpdateStatus;
    onLeave: boolean;
    leaveReason?: string;
  }) => void;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export const useWorkStore = create<WorkState>((set, get) => ({
  works,
  dailyStatuses: works.reduce((acc, work) => {
    acc[work.id] = getDailyStatusesByWorkId(work.id);
    return acc;
  }, {} as Record<string, DailyStatus[]>),
  searchQuery: '',
  filterRisk: 'all',
  filterFollowup: 'all',

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterRisk: (risk) => set({ filterRisk: risk }),
  setFilterFollowup: (followup) => set({ filterFollowup: followup }),

  getFilteredWorks: () => {
    const { works, searchQuery, filterRisk, filterFollowup } = get();
    return works.filter(work => {
      const matchesSearch = work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        work.authorName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = filterRisk === 'all' || work.riskLevel === filterRisk;
      const matchesFollowup = filterFollowup === 'all' || work.followupStatus === filterFollowup;
      return matchesSearch && matchesRisk && matchesFollowup;
    }).sort((a, b) => {
      const riskOrder = { red: 0, yellow: 1, green: 2 };
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    });
  },

  getWorkById: (id) => get().works.find(w => w.id === id),

  getDailyStatuses: (workId) => get().dailyStatuses[workId] || [],

  updateFollowupStatus: (workId, status) => {
    set(state => ({
      works: state.works.map(w =>
        w.id === workId ? { ...w, followupStatus: status } : w
      ),
    }));
  },

  submitDailyStatus: (workId, data) => {
    const today = formatDate(new Date());
    const now = new Date();

    let publishTime: string | undefined;
    if (data.updateStatus === 'published') {
      publishTime = formatTime(now);
    }

    const newStatus: DailyStatus = {
      id: generateId(),
      workId,
      date: today,
      wordCount: data.wordCount,
      draftCount: data.draftCount,
      updateStatus: data.updateStatus,
      publishTime,
      onLeave: data.onLeave,
      leaveReason: data.leaveReason,
      createdAt: formatDateTime(now),
    };

    set(state => {
      const existingStatuses = state.dailyStatuses[workId] || [];
      const filteredStatuses = existingStatuses.filter(s => s.date !== today);
      const updatedStatuses = [...filteredStatuses, newStatus].sort((a, b) => a.date.localeCompare(b.date));

      const updatedWorks = state.works.map(w => {
        if (w.id === workId) {
          const newRiskLevel = calculateRiskLevel(updatedStatuses);
          const newRiskReasons = calculateRiskReasons(updatedStatuses);
          return { ...w, riskLevel: newRiskLevel, riskReasons: newRiskReasons };
        }
        return w;
      });

      return {
        works: updatedWorks,
        dailyStatuses: {
          ...state.dailyStatuses,
          [workId]: updatedStatuses,
        },
      };
    });
  },
}));
