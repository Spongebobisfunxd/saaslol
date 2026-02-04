import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

// ── Types ────────────────────────────────────────────────────────────

interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  points: number;
  tier?: string;
  status: string;
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateCustomerPayload {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  tags?: string[];
}

interface UpdateCustomerPayload extends Partial<CreateCustomerPayload> {
  id: string;
}

// ── Hooks ────────────────────────────────────────────────────────────

export function useCustomers(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Customer>>(
        '/customers',
        { params: filters },
      );
      return data;
    },
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Customer }>(`/customers/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCustomerPayload) => {
      const { data } = await apiClient.post<Customer>('/customers', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateCustomerPayload) => {
      const { data } = await apiClient.patch<Customer>(`/customers/${id}`, payload);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', variables.id] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
