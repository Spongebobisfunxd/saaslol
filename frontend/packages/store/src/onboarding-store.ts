'use client';

import { create } from 'zustand';

export interface BusinessProfile {
  companyName: string;
  nip: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  website?: string;
  industry?: string;
}

export interface LoyaltyProgramConfig {
  name: string;
  type: 'points' | 'stamps' | 'tiers';
  pointsPerPLN?: number;
  stampsRequired?: number;
  tiers?: { name: string; threshold: number }[];
  welcomeBonus?: number;
}

export interface OnboardingState {
  /** Current wizard step (0-based) */
  currentStep: number;
  /** Business profile data collected during onboarding */
  businessProfile: Partial<BusinessProfile>;
  /** Loyalty programme configuration */
  loyaltyProgram: Partial<LoyaltyProgramConfig>;

  setStep: (step: number) => void;
  setBusinessProfile: (profile: Partial<BusinessProfile>) => void;
  setLoyaltyProgram: (program: Partial<LoyaltyProgramConfig>) => void;
  /** Reset the entire onboarding state (e.g. on completion or cancel) */
  reset: () => void;
}

const INITIAL: Pick<OnboardingState, 'currentStep' | 'businessProfile' | 'loyaltyProgram'> = {
  currentStep: 0,
  businessProfile: {},
  loyaltyProgram: {},
};

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  ...INITIAL,

  setStep: (currentStep) => set({ currentStep }),

  setBusinessProfile: (profile) =>
    set((state) => ({
      businessProfile: { ...state.businessProfile, ...profile },
    })),

  setLoyaltyProgram: (program) =>
    set((state) => ({
      loyaltyProgram: { ...state.loyaltyProgram, ...program },
    })),

  reset: () => set(INITIAL),
}));
