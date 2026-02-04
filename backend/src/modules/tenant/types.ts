export interface UpdateTenantDto {
  name?: string;
  settings?: Record<string, unknown>;
}

export interface CreateLocationDto {
  name: string;
  address?: string;
  city?: string;
  postalCode?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateLocationDto extends Partial<CreateLocationDto> {
  isActive?: boolean;
}
