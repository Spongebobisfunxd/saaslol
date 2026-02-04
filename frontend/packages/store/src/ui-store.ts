'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'pl' | 'en';

export interface UIState {
  /** Whether the sidebar / nav drawer is open */
  sidebarOpen: boolean;
  /** Current colour-scheme preference */
  theme: Theme;
  /** Current interface language */
  language: Language;

  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'system',
      language: 'pl',

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setTheme: (theme) => set({ theme }),

      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'loyalty-ui',
    },
  ),
);
