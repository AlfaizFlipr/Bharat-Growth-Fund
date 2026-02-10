import { useQuery } from "@tanstack/react-query";
import { teamUrls } from "../api-urls/api.url";
import { request } from "../../lib/axios.config";

export interface TeamReferralFilters {
    page?: number;
    limit?: number;
    search?: string;
    level?: string;
}

const fetchAllTeamReferrals = async (filters: TeamReferralFilters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value));
        }
    });

    const response = await request({
        url: teamUrls.ALL_REFERRALS + "?" + params.toString(),
        method: "GET",
    });
    return response.data;
};

const fetchTeamStatistics = async () => {
    const response = await request({
        url: teamUrls.STATISTICS,
        method: "GET",
    });
    return response.data;
};

export const useAdminTeamReferrals = (filters: TeamReferralFilters) =>
    useQuery({
        queryKey: ["admin-team-referrals", filters],
        queryFn: () => fetchAllTeamReferrals(filters),
    });

export const useAdminTeamStatistics = () =>
    useQuery({
        queryKey: ["admin-team-statistics"],
        queryFn: fetchTeamStatistics,
    });
