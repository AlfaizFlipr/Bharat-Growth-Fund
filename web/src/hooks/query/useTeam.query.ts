import { useQuery } from "@tanstack/react-query";
import { teamUrls } from "../api-urls/api.url";
import { request } from "../../lib/axios.config";

// Types
export interface TeamStats {
    totalMembers: number;
    teamLevels: Array<{
        level: string;
        count: number;
    }>;
}

export interface MyReferralsResponse {
    referrals: Array<any>;
    pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        limit: number;
    };
}

export interface ReferralLinkResponse {
    referralCode: string;
    referralLink: string;
    shareMessage: string;
}

// Fetchers
const fetchTeamStats = async (): Promise<TeamStats> => {
    const response = await request({
        url: teamUrls.STATS,
        method: "GET",
    });
    return response.data;
};

const fetchReferralLink = async (): Promise<ReferralLinkResponse> => {
    const response = await request({
        url: teamUrls.REFERRAL_LINK,
        method: "GET",
    });
    return response.data;
};

const fetchMyTeamReferrals = async (filters: any): Promise<MyReferralsResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
        }
    });

    const response = await request({
        url: `${teamUrls.MY_REFERRALS}?${params.toString()}`,
        method: "GET",
    });
    return response.data;
};

// Hooks
export const useTeamStatsQuery = () => {
    return useQuery({
        queryKey: ["team-stats"],
        queryFn: fetchTeamStats,
        staleTime: 30000,
    });
};

export const useReferralLinkQuery = () => {
    return useQuery({
        queryKey: ["referral-link"],
        queryFn: fetchReferralLink,
        staleTime: 60000,
    });
};

export const useMyTeamReferralsQuery = (filters: any) => {
    return useQuery({
        queryKey: ["my-team-referrals", filters],
        queryFn: () => fetchMyTeamReferrals(filters),
    });
};
