'use client';

import { create } from 'zustand';

export interface PendingOperation {
  id: string;
  type: 'add_points' | 'redeem_reward' | 'stamp' | 'register';
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface KioskCustomer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  points: number;
  tier?: string;
}

export interface KioskState {
  /** Whether the kiosk device has network connectivity */
  isOnline: boolean;
  /** Operations queued while offline, synced when connection is restored */
  pendingOperations: PendingOperation[];
  /** Customer currently interacting with the kiosk */
  currentCustomer: KioskCustomer | null;

  setOnline: (online: boolean) => void;
  addPendingOperation: (op: PendingOperation) => void;
  removePendingOperation: (id: string) => void;
  setCurrentCustomer: (customer: KioskCustomer) => void;
  clearCurrentCustomer: () => void;
}

export const useKioskStore = create<KioskState>()((set) => ({
  isOnline: true,
  pendingOperations: [],
  currentCustomer: null,

  setOnline: (isOnline) => set({ isOnline }),

  addPendingOperation: (op) =>
    set((state) => ({
      pendingOperations: [...state.pendingOperations, op],
    })),

  removePendingOperation: (id) =>
    set((state) => ({
      pendingOperations: state.pendingOperations.filter((op) => op.id !== id),
    })),

  setCurrentCustomer: (currentCustomer) => set({ currentCustomer }),

  clearCurrentCustomer: () => set({ currentCustomer: null }),
}));
