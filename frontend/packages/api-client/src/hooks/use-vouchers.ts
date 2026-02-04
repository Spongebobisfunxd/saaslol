import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

// ── Types ────────────────────────────────────────────────────────────

interface Voucher {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_product';
  discountPercent?: number;
  discountAmountGrosze?: number;
  productId?: string;
  maxUses: number;
  currentUses: number;
  status: string;
  validFrom: string;
  validUntil?: string;
  createdAt: string;
}

interface VoucherFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateVoucherPayload {
  code?: string;
  type: 'percentage' | 'fixed' | 'free_product';
  discountPercent?: number;
  discountAmountGrosze?: number;
  productId?: string;
  maxUses: number;
  validFrom: string;
  validUntil?: string;
}

interface ValidateVoucherResponse {
  valid: boolean;
  voucher?: Voucher;
  reason?: string;
}

// ── Hooks ────────────────────────────────────────────────────────────

export function useVouchers(filters: VoucherFilters = {}) {
  return useQuery({
    queryKey: ['vouchers', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Voucher>>(
        '/vouchers',
        { params: filters },
      );
      return data;
    },
  });
}

export function useVoucher(id: string) {
  return useQuery({
    queryKey: ['vouchers', id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Voucher }>(`/vouchers/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateVoucherPayload) => {
      const { data } = await apiClient.post<Voucher>('/vouchers', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
    },
  });
}

export function useValidateVoucher() {
  return useMutation({
    mutationFn: async (code: string) => {
      const { data } = await apiClient.post<ValidateVoucherResponse>(
        '/vouchers/validate',
        { code },
      );
      return data;
    },
  });
}

export function useRedeemVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      code,
      customerId,
    }: {
      code: string;
      customerId: string;
    }) => {
      const { data } = await apiClient.post('/vouchers/redeem', {
        code,
        customerId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
    },
  });
}
