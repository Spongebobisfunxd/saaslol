export interface GrantConsentDto {
  customerId: string;
  channel: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface RevokeConsentDto {
  customerId: string;
  channel: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface CreateConsentTemplateDto {
  channel: string;
  contentPl: string;
  contentEn?: string;
}
