import { Request, Response } from "express";
import models from "../../models";
import commonsUtils from "../../utils";
import mongoose from "mongoose";

const { JsonResponse } = commonsUtils;

// ==================== USER ENDPOINTS ====================

// Get team stats (USER)
const getTeamStats = async (req: Request, res: Response) => {
    try {
        const userId = res.locals.userId;

        if (!userId) {
            return JsonResponse(res, {
                status: "error",
                statusCode: 401,
                title: "Unauthorized",
                message: "User not authenticated",
            });
        }

        const teamReferrals = await models.TeamReferral.find({ userId }).lean();

        const levelA = teamReferrals.filter(ref => ref.level === 'A');
        const levelB = teamReferrals.filter(ref => ref.level === 'B');
        const levelC = teamReferrals.filter(ref => ref.level === 'C');

        const teamLevels = [
            { level: 'A', count: levelA.length },
            { level: 'B', count: levelB.length },
            { level: 'C', count: levelC.length },
        ];

        const totalMembers = teamReferrals.length;

        return JsonResponse(res, {
            status: "success",
            statusCode: 200,
            title: "Team Stats",
            message: "Team statistics retrieved successfully",
            data: {
                totalMembers,
                teamLevels,
            },
        });
    } catch (error: any) {
        console.error('Get team stats error:', error);
        return JsonResponse(res, {
            status: "error",
            statusCode: 500,
            title: "Server Error",
            message: error.message || "Failed to retrieve team statistics",
        });
    }
};

// Get referral link (USER)
const getReferralLink = async (req: Request, res: Response) => {
    try {
        const userId = res.locals.userId;

        if (!userId) {
            return JsonResponse(res, {
                status: "error",
                statusCode: 401,
                title: "Unauthorized",
                message: "User not authenticated",
            });
        }

        const user = await models.User.findById(userId);

        if (!user) {
            return JsonResponse(res, {
                status: "error",
                statusCode: 404,
                title: "User Not Found",
                message: "User not found",
            });
        }

        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const referralLink = `${baseUrl}/signup?ref=${user.referralCode}`;
        const shareMessage = `Join our amazing platform using my referral code: ${user.referralCode}\n\nSign up here: ${referralLink}`;

        return JsonResponse(res, {
            status: "success",
            statusCode: 200,
            title: "Referral Link",
            message: "Referral link retrieved successfully",
            data: {
                referralCode: user.referralCode,
                referralLink,
                shareMessage,
            },
        });
    } catch (error: any) {
        console.error('Get referral link error:', error);
        return JsonResponse(res, {
            status: "error",
            statusCode: 500,
            title: "Server Error",
            message: error.message || "Failed to retrieve referral link",
        });
    }
};

// Get referrals for user (USER)
const getUserTeamReferrals = async (req: Request, res: Response) => {
    try {
        const userId = res.locals.userId;
        const {
            page = 1,
            limit = 10,
            search = "",
            level = ""
        } = req.query;

        if (!userId) {
            return JsonResponse(res, {
                status: "error",
                statusCode: 401,
                title: "Unauthorized",
                message: "User not authenticated",
            });
        }

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const filter: any = { userId };

        if (level && level !== "all") {
            filter.level = level;
        }

        // Apply search if provided (search for referred user's name/phone)
        if (search) {
            const users = await models.User.find({
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { phone: { $regex: search, $options: "i" } }
                ]
            }).select('_id');

            filter.referredUserId = { $in: users.map(u => u._id) };
        }

        const [referrals, totalCount] = await Promise.all([
            models.TeamReferral.find(filter)
                .populate('referredUserId', 'name phone picture createdAt investmentAmount currentLevel levelName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            models.TeamReferral.countDocuments(filter)
        ]);

        const formattedReferrals = referrals.map((ref: any) => ({
            _id: ref._id,
            referredUser: {
                _id: ref.referredUserId?._id,
                name: ref.referredUserId?.name || 'N/A',
                phone: ref.referredUserId?.phone || 'N/A',
                picture: ref.referredUserId?.picture,
                joinedAt: ref.referredUserId?.createdAt,
                investmentAmount: ref.referredUserId?.investmentAmount || 0,
                currentLevel: ref.referredUserId?.levelName || 'No Level',
            },
            totalEarnings: ref.totalEarnings || 0,
            level: ref.level,
            referralChainLength: ref.referralChain?.length || 0,
            createdAt: ref.createdAt,
        }));

        return JsonResponse(res, {
            status: "success",
            statusCode: 200,
            title: "My Team Referrals",
            message: "Team referrals fetched successfully.",
            data: {
                referrals: formattedReferrals,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalCount / limitNum),
                    totalCount,
                    limit: limitNum
                }
            }
        });
    } catch (error: any) {
        console.error("💥 Get user team referrals error:", error);
        return JsonResponse(res, {
            status: "error",
            statusCode: 500,
            title: "Server Error",
            message: error.message || "Failed to fetch team referrals.",
        });
    }
};

// Get team referral history (USER)
const getTeamReferralHistory = async (req: Request, res: Response) => {
    try {
        const userId = res.locals.userId;
        const { page = 1, limit = 10, level = "", transactionType = "" } = req.query;

        if (!userId) {
            return JsonResponse(res, {
                status: "error",
                statusCode: 401,
                title: "Unauthorized",
                message: "User not authenticated",
            });
        }

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const filter: any = { userId };

        if (level && level !== "all") {
            filter.level = level;
        }

        if (transactionType && transactionType !== "all") {
            filter.transactionType = transactionType;
        }

        const [history, totalCount] = await Promise.all([
            models.TeamReferralHistory.find(filter)
                .populate('referredUserId', 'name phone picture')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            models.TeamReferralHistory.countDocuments(filter)
        ]);

        // Calculate total earnings
        const earningsResult = await models.TeamReferralHistory.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        return JsonResponse(res, {
            status: "success",
            statusCode: 200,
            title: "Team Referral History",
            message: "Referral history retrieved successfully",
            data: {
                history,
                totalEarnings: earningsResult[0]?.total || 0,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalCount / limitNum),
                    totalCount,
                    limit: limitNum
                }
            },
        });
    } catch (error: any) {
        console.error('Get team referral history error:', error);
        return JsonResponse(res, {
            status: "error",
            statusCode: 500,
            title: "Server Error",
            message: error.message || "Failed to retrieve referral history",
        });
    }
};

// ==================== ADMIN ENDPOINTS ====================

// Get all team referrals for admin (ADMIN)
const getAllTeamReferrals = async (req: Request, res: Response) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            level = ""
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const filter: any = {};

        if (level && level !== "all") {
            filter.level = level;
        }

        if (search) {
            const users = await models.User.find({
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { phone: { $regex: search, $options: "i" } }
                ]
            }).select('_id');

            const userIds = users.map(u => u._id);
            filter.$or = [
                { userId: { $in: userIds } },
                { referredUserId: { $in: userIds } }
            ];
        }

        const [referrals, totalCount] = await Promise.all([
            models.TeamReferral.find(filter)
                .populate('userId', 'name phone picture createdAt')
                .populate('referredUserId', 'name phone picture createdAt')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            models.TeamReferral.countDocuments(filter)
        ]);

        return JsonResponse(res, {
            status: "success",
            statusCode: 200,
            title: "Team Referrals",
            message: "Team referrals fetched successfully.",
            data: {
                referrals,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalCount / limitNum),
                    totalCount,
                    limit: limitNum
                }
            }
        });
    } catch (err) {
        console.error("💥 Get all team referrals error:", err);
        return JsonResponse(res, {
            status: "error",
            statusCode: 500,
            title: "Server Error",
            message: "Failed to fetch team referrals.",
        });
    }
};

// Get team statistics (ADMIN)
const getTeamStatistics = async (req: Request, res: Response) => {
    try {
        const stats = await models.TeamReferral.aggregate([
            {
                $group: {
                    _id: "$level",
                    count: { $sum: 1 }
                }
            }
        ]);

        const levelACount = stats.find(s => s._id === 'A')?.count || 0;
        const levelBCount = stats.find(s => s._id === 'B')?.count || 0;
        const levelCCount = stats.find(s => s._id === 'C')?.count || 0;
        const totalReferrals = levelACount + levelBCount + levelCCount;

        return JsonResponse(res, {
            status: "success",
            statusCode: 200,
            title: "Team Statistics",
            message: "Statistics fetched successfully.",
            data: {
                totalReferrals,
                levelACount,
                levelBCount,
                levelCCount
            }
        });
    } catch (err) {
        console.error("💥 Get team statistics error:", err);
        return JsonResponse(res, {
            status: "error",
            statusCode: 500,
            title: "Server Error",
            message: "Failed to fetch team statistics.",
        });
    }
};

export default {
    getTeamStats,
    getReferralLink,
    getUserTeamReferrals,
    getTeamReferralHistory,
    getAllTeamReferrals,
    getTeamStatistics
};
