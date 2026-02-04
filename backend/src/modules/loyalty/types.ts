export interface EarnRuleDto {
  type: 'per_amount' | 'fixed' | 'multiplier';
  value: number;
  minAmount?: number;
  maxPoints?: number;
  categoryId?: string;
  description?: string;
}

export interface BurnRuleDto {
  type: 'fixed_rate' | 'variable';
  pointsPerUnit: number;
  minPoints?: number;
  maxPointsPerTransaction?: number;
  description?: string;
}

export interface CreateProgramDto {
  name: string;
  type?: string;
  description?: string;
  earnRules: EarnRuleDto[];
  burnRules: BurnRuleDto[];
  isActive?: boolean;
}

export interface UpdateProgramDto {
  name?: string;
  type?: string;
  description?: string;
  earnRules?: EarnRuleDto[];
  burnRules?: BurnRuleDto[];
  isActive?: boolean;
}
