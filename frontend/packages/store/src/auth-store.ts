'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  /** Currently authenticated user, or `null` */
  user: AuthUser | null;
  /** JWT tokens */
  tokens: AuthTokens | null;
  /** Derived convenience flag */
  isAuthenticated: boolean;

  /** Set user + tokens after successful login */
  login: (user: AuthUser, tokens: AuthTokens) => void;
  /** Clear all auth state */
  logout: () => void;
  /** Replace tokens (e.g. after a silent refresh) */
  setTokens: (tokens: AuthTokens) => void;
  /** Replace the user object (e.g. after profile update) */
  setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,

      login: (user, tokens) =>
        set({ user, tokens, isAuthenticated: true }),

      logout: () =>
        set({ user: null, tokens: null, isAuthenticated: false }),

      setTokens: (tokens) => set({ tokens }),

      setUser: (user) => set({ user }),
    }),
    {
      name: 'loyalty-auth',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
