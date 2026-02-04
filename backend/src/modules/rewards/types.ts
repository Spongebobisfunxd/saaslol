export interface CreateRewardDto {
  name: string;
  description?: string;
  pointsCost: number;
  imageUrl?: string;
  stock?: number;
  validFrom?: string;
  validUntil?: string;
}

export interface UpdateRewardDto {
  name?: string;
  description?: string;
  pointsCost?: number;
  status?: string;
  imageUrl?: string;
  stock?: number;
  validFrom?: string;
  validUntil?: string;
}
