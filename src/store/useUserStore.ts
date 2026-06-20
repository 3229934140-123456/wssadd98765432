import { create } from 'zustand';
import type { User, UserRole } from '../types/user';
import { editors, authors } from '../utils/mockData';

interface UserState {
  currentUser: User | null;
  login: (role: UserRole, userId?: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: editors[0],
  login: (role: UserRole, userId?: string) => {
    let user: User | null = null;
    if (role === 'editor') {
      user = userId ? editors.find(e => e.id === userId) || editors[0] : editors[0];
    } else {
      user = userId ? authors.find(a => a.id === userId) || authors[0] : authors[0];
    }
    set({ currentUser: user });
  },
  logout: () => set({ currentUser: null }),
}));
