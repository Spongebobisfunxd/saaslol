import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

// ── Types ────────────────────────────────────────────────────────────

interface Program {
  id: string;
  name: string;
  description?: string;
  type: 'points' | 'stamps' | 'tiers' | 'cashback' | 'hybrid';
  status: string;
  pointsPerPLN?: number;
  welcomeBonus?: number;
  createdAt: string;
}

interface CreateProgramPayload {
  name: string;
  description?: string;
  type: 'points' | 'stamps' | 'tiers' | 'cashback' | 'hybrid';
  pointsPerPLN?: number;
  welcomeBonus?: number;
  rules?: Record<string, unknown>;
}

interface UpdateProgramPayload extends Partial<CreateProgramPayload> {
  id: string;
}

// ── Hooks ────────────────────────────────────────────────────────────

export function usePrograms() {
  return useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const { data } = await apiClient.get<Program[]>('/programs');
      return data;
    },
  });
}

export function useProgram(id: string) {
  return useQuery({
    queryKey: ['programs', id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Program }>(`/programs/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateProgramPayload) => {
      const { data } = await apiClient.post<Program>('/programs', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}

export function useUpdateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateProgramPayload) => {
      const { data } = await apiClient.patch<Program>(`/programs/${id}`, payload);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['programs', variables.id] });
    },
  });
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/programs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}
