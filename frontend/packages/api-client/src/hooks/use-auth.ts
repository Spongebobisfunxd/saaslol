import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { useAuthStore } from '@loyalty/store';

// ── Types ────────────────────────────────────────────────────────────

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  nip: string;
  phone: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      tenantId: string;
      tenantName?: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  };
}

// ── Hooks ────────────────────────────────────────────────────────────

export function useLogin() {
  const { login } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
      return data;
    },
    onSuccess: (resp) => {
      login(resp.data.user, {
        accessToken: resp.data.tokens.accessToken,
        refreshToken: resp.data.tokens.refreshToken,
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useRegister() {
  const { login } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
      return data;
    },
    onSuccess: (resp) => {
      login(resp.data.user, {
        accessToken: resp.data.tokens.accessToken,
        refreshToken: resp.data.tokens.refreshToken,
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
    },
    onSettled: () => {
      logout();
      queryClient.clear();
    },
  });
}

export function useMe() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await apiClient.get('/auth/me');
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
