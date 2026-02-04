export { apiClient } from './client';

export { useLogin, useRegister, useLogout, useMe } from './hooks/use-auth';
export {
  useCustomers,
  useCustomer,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from './hooks/use-customers';
export {
  usePrograms,
  useProgram,
  useCreateProgram,
  useUpdateProgram,
  useDeleteProgram,
} from './hooks/use-loyalty';
export {
  useRewards,
  useReward,
  useCreateReward,
  useUpdateReward,
  useDeleteReward,
  useRedeemReward,
} from './hooks/use-rewards';
export {
  useTransactions,
  useTransaction,
  useCreateTransaction,
} from './hooks/use-transactions';
export {
  useCampaigns,
  useCampaign,
  useCreateCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
} from './hooks/use-campaigns';
export {
  useDashboardMetrics,
  useDailyAnalytics,
} from './hooks/use-analytics';
export {
  useStampDefinitions,
  useStampDefinition,
  useCreateStampDefinition,
  useUpdateStampDefinition,
  useStampCards,
  useStampCard,
  useAddStamp,
} from './hooks/use-stamps';
export {
  useGiftCards,
  useGiftCard,
  useCreateGiftCard,
  useActivateGiftCard,
  useRechargeGiftCard,
} from './hooks/use-gift-cards';
export {
  useVouchers,
  useVoucher,
  useCreateVoucher,
  useValidateVoucher,
  useRedeemVoucher,
} from './hooks/use-vouchers';
