export interface CreateStampCardDefDto {
  name: string;
  stampsRequired: number;
  rewardDescription: string;
  rewardId?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface UpdateStampCardDefDto {
  name?: string;
  stampsRequired?: number;
  rewardDescription?: string;
  rewardId?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface CreateStampCardDto {
  customerId: string;
  definitionId: string;
}

export interface AddStampDto {
  customerId: string;
  definitionId: string;
  locationId?: string;
}
