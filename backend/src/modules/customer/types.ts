export interface CreateCustomerDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  birthDate?: string;
  tags?: string[];
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

export interface CustomerFilter {
  search?: string;
  tags?: string[];
  tierId?: string;
  minPoints?: number;
  maxPoints?: number;
  joinedAfter?: string;
  joinedBefore?: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
