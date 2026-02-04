export interface CreateCampaignDto {
  name: string;
  channel: string;
  subject?: string;
  content: string;
  audienceFilter?: Record<string, unknown>;
  scheduledAt?: string;
}

export interface UpdateCampaignDto extends Partial<CreateCampaignDto> {}
