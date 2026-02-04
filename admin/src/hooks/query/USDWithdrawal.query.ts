import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usdWithdrawalUrls, userUrls } from "../api-urls/api.url";
import { request } from "../../lib/axios.config";



interface USDWithdrawalFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

interface ToggleUSDUserPayload {
  userId: string;
  isUSDUser: boolean;
}

interface FundUSDWalletPayload {
  userId: string;
  amountINR: number;
  description?: string;
}

interface ApproveUSDWithdrawalPayload {
  withdrawalId: string;
  remarks?: string;
}

interface RejectUSDWithdrawalPayload {
  withdrawalId: string;
  reason: string;
}




const fetchAllUSDWithdrawals = async (filters: USDWithdrawalFilters) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const response = await request({
    url: usdWithdrawalUrls.USD_WITHDRAWALS + "?" + params.toString(),
    method: "GET",
  });

  return response.data;
};


const fetchUSDWalletByUser = async (userId: string) => {
  const response = await request({
    url: userUrls.GET_USD_WALLET(userId),
    method: "GET",
  });

  return response.data;
};




const toggleUSDUserStatus = async ({ userId, isUSDUser }: ToggleUSDUserPayload) => {
  const response = await request({
    url: userUrls.TOGGLE_USD_USER(userId),
    method: "PATCH",
    data: { isUSDUser },
  });

  return response.data;
};


const fundUSDWallet = async ({ userId, amountINR, description }: FundUSDWalletPayload) => {
  const response = await request({
    url: userUrls.FUND_USD_WALLET(userId),
    method: "POST",
    data: { amountINR, description },
  });

  return response.data;
};


const approveUSDWithdrawal = async ({ withdrawalId, remarks }: ApproveUSDWithdrawalPayload) => {
  const response = await request({
    url: usdWithdrawalUrls.APPROVE_USD_WITHDRAWAL(withdrawalId),
    method: "PATCH",
    data: { remarks },
  });

  return response.data;
};


const rejectUSDWithdrawal = async ({ withdrawalId, reason }: RejectUSDWithdrawalPayload) => {
  const response = await request({
    url: usdWithdrawalUrls.REJECT_USD_WITHDRAWAL(withdrawalId),
    method: "PATCH",
    data: { reason },
  });

  return response.data;
};




export const useAllUSDWithdrawals = (filters: USDWithdrawalFilters) =>
  useQuery({
    queryKey: ["admin-usd-withdrawals", filters],
    queryFn: () => fetchAllUSDWithdrawals(filters),
    staleTime: 30 * 1000, 
  });


export const useUSDWalletByUser = (userId: string) =>
  useQuery({
    queryKey: ["admin-usd-wallet", userId],
    queryFn: () => fetchUSDWalletByUser(userId),
    enabled: !!userId,
  });


export const useToggleUSDUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleUSDUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-usd-wallet"] });
    },
  });
};


export const useFundUSDWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fundUSDWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-usd-wallet"] });
    },
  });
};


export const useApproveUSDWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveUSDWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-usd-withdrawals"] });
    },
  });
};


export const useRejectUSDWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectUSDWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-usd-withdrawals"] });
    },
  });
};




const fetchWithdrawalSettings = async () => {
  const response = await request({
    url: usdWithdrawalUrls.GET_SETTINGS,
    method: "GET",
  });
  return response.data;
};

export const useWithdrawalSettings = () =>
  useQuery({
    queryKey: ["withdrawal-settings"],
    queryFn: fetchWithdrawalSettings,
    staleTime: 60 * 1000,
  });


interface UpdateSettingsPayload {
  stripeEnabled?: boolean;
  bitgetEnabled?: boolean;
  bitgetApiKey?: string;
  bitgetSecretKey?: string;
  bitgetPassphrase?: string;
  bitgetNetwork?: string;
  bitgetCurrency?: string;
  usdExchangeRate?: number;
  minWithdrawalINR?: number;
  maxWithdrawalINR?: number;
  stripeFeePercent?: number;
  bitgetFeePercent?: number;
  defaultWithdrawalMethod?: 'stripe' | 'bitget';
  notes?: string;
}

const updateWithdrawalSettings = async (payload: UpdateSettingsPayload) => {
  const response = await request({
    url: usdWithdrawalUrls.UPDATE_SETTINGS,
    method: "PUT",
    data: payload,
  });
  return response.data;
};

export const useUpdateWithdrawalSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateWithdrawalSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawal-settings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-usd-withdrawals"] });
    },
  });
};


const testBitgetConnection = async () => {
  const response = await request({
    url: usdWithdrawalUrls.TEST_BITGET,
    method: "GET",
  });
  return response.data;
};

export const useTestBitgetConnection = () => {
  return useMutation({
    mutationFn: testBitgetConnection,
  });
};


export const useBitgetBalance = () =>
  useQuery({
    queryKey: ["bitget-balance"],
    queryFn: testBitgetConnection,
    staleTime: 30 * 1000, 
    refetchInterval: 60 * 1000, 
  });


const checkBitgetStatus = async (withdrawalId: string) => {
  const response = await request({
    url: usdWithdrawalUrls.BITGET_STATUS(withdrawalId),
    method: "GET",
  });
  return response.data;
};

export const useCheckBitgetStatus = () => {
  return useMutation({
    mutationFn: checkBitgetStatus,
  });
};