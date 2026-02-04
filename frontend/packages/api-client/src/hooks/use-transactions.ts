import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

// ── Types ────────────────────────────────────────────────────────────

interface Transaction {
  id: string;
  customerId: string;
  type: string;
  amountGrosze: number;
  pointsEarned: number;
  pointsSpent: number;
  description?: string;
  createdAt: string;
}

interface TransactionFilters {
  page?: number;
  limit?: number;
  customerId?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateTransactionPayload {
  customerId: string;
  type: string;
  amountGrosze: number;
  description?: string;
  metadata?: Record<string, unknown>;
}

// ── Hooks ────────────────────────────────────────────────────────────

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Transaction>>(
        '/transactions',
        { params: filters },
      );
      return data;
    },
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Transaction }>(`/transactions/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTransactionPayload) => {
      const { data } = await apiClient.post<Transaction>('/transactions', payload);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({
        queryKey: ['customers', variables.customerId],
      });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
