import { useQuery } from '@tanstack/react-query';
import { request } from '../../lib/axios.config';

export const getDashboardStats = async () => {
    const response = await request({
        url: '/admin/dashboard/stats',
        method: 'GET',
    });
    return response?.data;
};

export const useDashboardStatsQuery = () => {
    return useQuery({
        queryKey: ['dashboardStats'],
        queryFn: getDashboardStats,
        refetchInterval: 30000, 
    });
};
