
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminUrls } from "../api-urls/api.url";
import { request } from "../../lib/axios.config";


interface LevelFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

interface CreateLevelPayload {
  levelNumber: number;
  levelName: string;
  investmentAmount: number;
  dailyIncome: number;
  icon?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

interface UpdateLevelPayload {
  levelId: string;
  data: Partial<CreateLevelPayload>;
}


const fetchAllLevels = async (filters: LevelFilters) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const response = await request({
    url: `${adminUrls.LEVELS}?${params.toString()}`,
    method: "GET",
  });

  return response.data;
};


const fetchLevelById = async (levelId: string) => {
  const response = await request({
    url: `${adminUrls.LEVELS}/${levelId}`,
    method: "GET",
  });

  return response.data;
};


const createLevel = async (data: CreateLevelPayload) => {
  const response = await request({
    url: adminUrls.LEVELS,
    method: "POST",
    data,
  });

  return response.data;
};


const updateLevel = async ({ levelId, data }: UpdateLevelPayload) => {
  const response = await request({
    url: `${adminUrls.LEVELS}/${levelId}`,
    method: "PUT",
    data,
  });

  return response.data;
};


const deleteLevel = async (levelId: string) => {
  const response = await request({
    url: `${adminUrls.LEVELS}/${levelId}`,
    method: "DELETE",
  });

  return response.data;
};


export const useAllLevels = (filters: LevelFilters) => {
  return useQuery({
    queryKey: ["admin-levels", filters],
    queryFn: () => fetchAllLevels(filters),
    staleTime: 30000, 
  });
};

export const useLevelById = (levelId: string) => {
  return useQuery({
    queryKey: ["admin-level", levelId],
    queryFn: () => fetchLevelById(levelId),
    enabled: !!levelId,
  });
};

export const useCreateLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-levels"] });
    },
  });
};

export const useUpdateLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-levels"] });
      queryClient.invalidateQueries({ queryKey: ["admin-level"] });
    },
  });
};

export const useDeleteLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-levels"] });
    },
  });
};