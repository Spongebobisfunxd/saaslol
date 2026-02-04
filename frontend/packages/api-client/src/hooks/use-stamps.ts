import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

// ── Types ────────────────────────────────────────────────────────────

interface StampDefinition {
  id: string;
  name: string;
  description?: string;
  stampsRequired: number;
  rewardDescription: string;
  status: string;
  imageUrl?: string;
  createdAt: string;
}

interface StampCard {
  id: string;
  customerId: string;
  definitionId: string;
  currentStamps: number;
  stampsRequired: number;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
}

interface CreateStampDefinitionPayload {
  name: string;
  description?: string;
  stampsRequired: number;
  rewardDescription: string;
  imageUrl?: string;
}

interface UpdateStampDefinitionPayload extends Partial<CreateStampDefinitionPayload> {
  id: string;
}

interface AddStampPayload {
  cardId: string;
  count?: number;
}

// ── Hooks ────────────────────────────────────────────────────────────

export function useStampDefinitions() {
  return useQuery({
    queryKey: ['stamps', 'definitions'],
    queryFn: async () => {
      const { data } = await apiClient.get<StampDefinition[]>('/stamps/definitions');
      return data;
    },
  });
}

export function useStampDefinition(id: string) {
  return useQuery({
    queryKey: ['stamps', 'definitions', id],
    queryFn: async () => {
      const { data } = await apiClient.get<StampDefinition>(
        `/stamps/definitions/${id}`,
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateStampDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStampDefinitionPayload) => {
      const { data } = await apiClient.post<StampDefinition>(
        '/stamps/definitions',
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stamps', 'definitions'] });
    },
  });
}

export function useUpdateStampDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateStampDefinitionPayload) => {
      const { data } = await apiClient.patch<StampDefinition>(
        `/stamps/definitions/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stamps', 'definitions'] });
      queryClient.invalidateQueries({
        queryKey: ['stamps', 'definitions', variables.id],
      });
    },
  });
}

export function useStampCards(customerId?: string) {
  return useQuery({
    queryKey: ['stamps', 'cards', { customerId }],
    queryFn: async () => {
      const { data } = await apiClient.get<StampCard[]>('/stamps/cards', {
        params: customerId ? { customerId } : undefined,
      });
      return data;
    },
  });
}

export function useStampCard(id: string) {
  return useQuery({
    queryKey: ['stamps', 'cards', id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: StampCard }>(`/stamps/cards/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useAddStamp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddStampPayload) => {
      const { data } = await apiClient.post<StampCard>(
        `/stamps/cards/${payload.cardId}/stamp`,
        { count: payload.count ?? 1 },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stamps', 'cards'] });
    },
  });
}
