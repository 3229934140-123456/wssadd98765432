import { create } from 'zustand';
import type {
  Work,
  DailyStatus,
  UpdateStatus,
  FollowupStatus,
  FollowupHistory,
  FollowupActionType,
} from '../types/work';
import { works, getDailyStatusesByWorkId } from '../utils/mockData';
import { calculateRiskLevel, calculateRiskReasons } from '../utils/riskCalculator';
import { formatDate, formatDateTime, formatTime } from '../utils/dateUtils';
import {
  saveToStorage,
  loadFromStorage,
  STORAGE_KEYS,
} from '../utils/storage';

interface WorkState {
  works: Work[];
  dailyStatuses: Record<string, DailyStatus[]>;
  followupHistories: Record<string, FollowupHistory[]>;
  searchQuery: string;
  filterRisk: string;
  filterFollowup: string;
  filterResolved: string;
  setSearchQuery: (query: string) => void;
  setFilterRisk: (risk: string) => void;
  setFilterFollowup: (followup: string) => void;
  setFilterResolved: (resolved: string) => void;
  getFilteredWorks: () => Work[];
  getWorkById: (id: string) => Work | undefined;
  getDailyStatuses: (workId: string) => DailyStatus[];
  getFollowupHistories: (workId: string) => FollowupHistory[];
  updateFollowupStatus: (workId: string, status: FollowupStatus, note?: string) => void;
  resolveRisk: (workId: string, resolution: string) => void;
  addFollowupHistory: (
    workId: string,
    actionType: FollowupActionType,
    data: {
      oldStatus?: FollowupStatus;
      newStatus?: FollowupStatus;
      messageType?: string;
      note?: string;
      resolution?: string;
    }
  ) => void;
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

function initializeDailyStatuses(): Record<string, DailyStatus[]> {
  const stored = loadFromStorage<Record<string, DailyStatus[]> | null>(
    STORAGE_KEYS.DAILY_STATUSES,
    null
  );
  if (stored) return stored;

  return works.reduce((acc, work) => {
    acc[work.id] = getDailyStatusesByWorkId(work.id);
    return acc;
  }, {} as Record<string, DailyStatus[]>);
}

function initializeWorks(): Work[] {
  const stored = loadFromStorage<Work[] | null>(STORAGE_KEYS.WORKS, null);
  if (stored) return stored;
  return works;
}

function initializeFollowupHistories(): Record<string, FollowupHistory[]> {
  const stored = loadFromStorage<Record<string, FollowupHistory[]> | null>(
    STORAGE_KEYS.FOLLOWUP_HISTORIES,
    null
  );
  if (stored) return stored;
  return {};
}

const initialDailyStatuses = initializeDailyStatuses();
const initialWorks = initializeWorks();
const initialFollowupHistories = initializeFollowupHistories();

export const useWorkStore = create<WorkState>((set, get) => ({
  works: initialWorks,
  dailyStatuses: initialDailyStatuses,
  followupHistories: initialFollowupHistories,
  searchQuery: '',
  filterRisk: 'all',
  filterFollowup: 'all',
  filterResolved: 'all',

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterRisk: (risk) => set({ filterRisk: risk }),
  setFilterFollowup: (followup) => set({ filterFollowup: followup }),
  setFilterResolved: (resolved) => set({ filterResolved: resolved }),

  getFilteredWorks: () => {
    const { works, searchQuery, filterRisk, filterFollowup, filterResolved } = get();
    return works.filter(work => {
      const matchesSearch = work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        work.authorName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = filterRisk === 'all' || work.riskLevel === filterRisk;
      const matchesFollowup = filterFollowup === 'all' || work.followupStatus === filterFollowup;
      const isResolved = work.followupStatus === 'resolved';
      const matchesResolved =
        filterResolved === 'all' ||
        (filterResolved === 'resolved' && isResolved) ||
        (filterResolved === 'pending' && !isResolved);
      return matchesSearch && matchesRisk && matchesFollowup && matchesResolved;
    }).sort((a, b) => {
      const riskOrder = { red: 0, yellow: 1, green: 2 };
      const aResolved = a.followupStatus === 'resolved' ? 1 : 0;
      const bResolved = b.followupStatus === 'resolved' ? 1 : 0;
      if (aResolved !== bResolved) return aResolved - bResolved;
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    });
  },

  getWorkById: (id) => get().works.find(w => w.id === id),

  getDailyStatuses: (workId) => get().dailyStatuses[workId] || [],

  getFollowupHistories: (workId) => {
    const histories = get().followupHistories[workId] || [];
    return [...histories].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  addFollowupHistory: (workId, actionType, data) => {
    const { currentUser } = useUserStore.getState();
    if (!currentUser) return;

    const history: FollowupHistory = {
      id: generateId(),
      workId,
      operatorId: currentUser.id,
      operatorName: currentUser.name,
      operatorRole: currentUser.role,
      actionType,
      oldStatus: data.oldStatus,
      newStatus: data.newStatus,
      messageType: data.messageType,
      note: data.note,
      resolution: data.resolution,
      createdAt: formatDateTime(new Date()),
    };

    set(state => {
      const existingHistories = state.followupHistories[workId] || [];
      const newHistories = [...existingHistories, history];
      const newAllHistories = {
        ...state.followupHistories,
        [workId]: newHistories,
      };
      saveToStorage(STORAGE_KEYS.FOLLOWUP_HISTORIES, newAllHistories);
      return { followupHistories: newAllHistories };
    });
  },

  updateFollowupStatus: (workId, status, note) => {
    const work = get().getWorkById(workId);
    if (!work) return;

    const oldStatus = work.followupStatus;

    set(state => {
      const newWorks = state.works.map(w => {
        if (w.id === workId) {
          const updated = {
            ...w,
            followupStatus: status,
          };
          if (status !== 'resolved') {
            delete updated.resolutionNote;
            delete updated.resolvedAt;
          }
          return updated;
        }
        return w;
      });
      saveToStorage(STORAGE_KEYS.WORKS, newWorks);
      return { works: newWorks };
    });

    get().addFollowupHistory(workId, 'status_change', {
      oldStatus,
      newStatus: status,
      note,
    });
  },

  resolveRisk: (workId, resolution) => {
    const work = get().getWorkById(workId);
    if (!work) return;

    const oldStatus = work.followupStatus;

    set(state => {
      const newWorks = state.works.map(w => {
        if (w.id === workId) {
          return {
            ...w,
            followupStatus: 'resolved' as const,
            resolutionNote: resolution,
            resolvedAt: formatDateTime(new Date()),
          };
        }
        return w;
      });
      saveToStorage(STORAGE_KEYS.WORKS, newWorks);
      return { works: newWorks };
    });

    get().addFollowupHistory(workId, 'risk_resolved', {
      oldStatus,
      newStatus: 'resolved',
      resolution,
    });
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
          return {
            ...w,
            riskLevel: newRiskLevel,
            riskReasons: newRiskReasons,
            ...(newRiskLevel === 'green' && w.followupStatus !== 'resolved'
              ? { followupStatus: 'untreated' as const }
              : {}),
          };
        }
        return w;
      });

      const newDailyStatuses = {
        ...state.dailyStatuses,
        [workId]: updatedStatuses,
      };

      saveToStorage(STORAGE_KEYS.DAILY_STATUSES, newDailyStatuses);
      saveToStorage(STORAGE_KEYS.WORKS, updatedWorks);

      return {
        works: updatedWorks,
        dailyStatuses: newDailyStatuses,
      };
    });
  },
}));

import { useUserStore } from './useUserStore';
