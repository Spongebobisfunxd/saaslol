import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

// ── Types ────────────────────────────────────────────────────────────

interface Reward {
  id: string;
  name: string;
  description?: string;
  pointsCost: number;
  type: string;
  category?: string;
  stock?: number;
  status: string;
  imageUrl?: string;
  createdAt: string;
}

interface RewardFilters {
  page?: number;
  limit?: number;
  type?: string;
  category?: string;
  status?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateRewardPayload {
  name: string;
  description?: string;
  pointsCost: number;
  type: string;
  category?: string;
  stock?: number;
  maxPerCustomer?: number;
  validFrom?: string;
  validUntil?: string;
  imageUrl?: string;
  terms?: string;
}

interface UpdateRewardPayload extends Partial<CreateRewardPayload> {
  id: string;
}

interface RedeemRewardPayload {
  rewardId: string;
  customerId: string;
}

// ── Hooks ────────────────────────────────────────────────────────────

export function useRewards(filters: RewardFilters = {}) {
  return useQuery({
    queryKey: ['rewards', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Reward>>(
        '/rewards',
        { params: filters },
      );
      return data;
    },
  });
}

export function useReward(id: string) {
  return useQuery({
    queryKey: ['rewards', id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Reward }>(`/rewards/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateRewardPayload) => {
      const { data } = await apiClient.post<Reward>('/rewards', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
}

export function useUpdateReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateRewardPayload) => {
      const { data } = await apiClient.patch<Reward>(`/rewards/${id}`, payload);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['rewards', variables.id] });
    },
  });
}

export function useDeleteReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/rewards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
}

export function useRedeemReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RedeemRewardPayload) => {
      const { data } = await apiClient.post('/rewards/redeem', payload);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({
        queryKey: ['customers', variables.customerId],
      });
    },
  });
}
