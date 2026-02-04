import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

// ── Types ────────────────────────────────────────────────────────────

interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  channel: string;
  startDate: string;
  endDate?: string;
  targetAudience?: string;
  bonusPoints?: number;
  multiplier?: number;
  createdAt: string;
}

interface CreateCampaignPayload {
  name: string;
  description?: string;
  type: string;
  channel: string;
  startDate: string;
  endDate?: string;
  targetAudience?: string;
  bonusPoints?: number;
  multiplier?: number;
  conditions?: Record<string, unknown>;
  message?: string;
}

interface UpdateCampaignPayload extends Partial<CreateCampaignPayload> {
  id: string;
}

// ── Hooks ────────────────────────────────────────────────────────────

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data } = await apiClient.get<Campaign[]>('/campaigns');
      return data;
    },
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Campaign }>(`/campaigns/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCampaignPayload) => {
      const { data } = await apiClient.post<Campaign>('/campaigns', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateCampaignPayload) => {
      const { data } = await apiClient.patch<Campaign>(`/campaigns/${id}`, payload);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns', variables.id] });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}
