import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

// ── Types ────────────────────────────────────────────────────────────

interface GiftCard {
  id: string;
  code: string;
  initialAmountGrosze: number;
  currentAmountGrosze: number;
  status: string;
  customerId?: string;
  expiresAt?: string;
  createdAt: string;
}

interface GiftCardFilters {
  page?: number;
  limit?: number;
  status?: string;
  customerId?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateGiftCardPayload {
  initialAmountGrosze: number;
  customerId?: string;
  expiresAt?: string;
}

interface RechargeGiftCardPayload {
  id: string;
  amountGrosze: number;
}

// ── Hooks ────────────────────────────────────────────────────────────

export function useGiftCards(filters: GiftCardFilters = {}) {
  return useQuery({
    queryKey: ['gift-cards', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<GiftCard>>(
        '/gift-cards',
        { params: filters },
      );
      return data;
    },
  });
}

export function useGiftCard(id: string) {
  return useQuery({
    queryKey: ['gift-cards', id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: GiftCard }>(`/gift-cards/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateGiftCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateGiftCardPayload) => {
      const { data } = await apiClient.post<GiftCard>('/gift-cards', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gift-cards'] });
    },
  });
}

export function useActivateGiftCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<GiftCard>(
        `/gift-cards/${id}/activate`,
      );
      return data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['gift-cards'] });
      queryClient.invalidateQueries({ queryKey: ['gift-cards', id] });
    },
  });
}

export function useRechargeGiftCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, amountGrosze }: RechargeGiftCardPayload) => {
      const { data } = await apiClient.post<GiftCard>(
        `/gift-cards/${id}/recharge`,
        { amountGrosze },
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gift-cards'] });
      queryClient.invalidateQueries({
        queryKey: ['gift-cards', variables.id],
      });
    },
  });
}
