import { Request, Response, NextFunction } from 'express';
import commonsUtils from '../../utils';
import models from '../../models';

const { JsonResponse } = commonsUtils;

export const getDashboardStats = async (
    req: Request,
    res: Response,
    __: NextFunction,
) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalUsers,
            totalBalanceResult,
            pendingWithdrawals,
            pendingRecharges,
            todayIncomeResult,
            todayRechargesResult,
            todayWithdrawalsResult,
            userLevelsResult,
            totalRechargesResult,
            totalWithdrawalsResult
        ] = await Promise.all([
            
            models.User.countDocuments(),

            
            models.User.aggregate([
                { $group: { _id: null, total: { $sum: '$mainWallet' } } }
            ]),

            
            models.withdrawal.countDocuments({ status: 'pending' }),

            
            models.recharge.countDocuments({ status: { $in: ['pending', 'processing'] } }),

            
            models.transaction.aggregate([
                {
                    $match: {
                        type: 'DAILY_INCOME',
                        createdAt: { $gte: today }
                    }
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),

            
            models.recharge.aggregate([
                {
                    $match: {
                        status: 'completed',
                        approvedAt: { $gte: today }
                    }
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),

            
            models.withdrawal.aggregate([
                {
                    $match: {
                        status: 'completed',
                        updatedAt: { $gte: today }
                    }
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),

            
            models.User.aggregate([
                { $match: { role: 'user', currentLevelNumber: { $exists: true } } },
                { $group: { _id: '$currentLevelNumber', count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),

            
            models.recharge.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),

            
            models.withdrawal.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ])
        ]);

        const stats = {
            totalUsers,
            totalPrimeWalletBalance: totalBalanceResult[0]?.total || 0,
            pendingWithdrawalsCount: pendingWithdrawals,
            pendingRechargesCount: pendingRecharges,
            dailyIncomeDistributed: todayIncomeResult[0]?.total || 0,
            todayRecharges: todayRechargesResult[0]?.total || 0,
            todayWithdrawals: todayWithdrawalsResult[0]?.total || 0,
            totalRecharges: totalRechargesResult[0]?.total || 0,
            totalWithdrawals: totalWithdrawalsResult[0]?.total || 0,
            levelDistribution: userLevelsResult.map((l: any) => ({
                level: l._id,
                count: l.count
            }))
        };

        return JsonResponse(res, {
            status: 'success',
            statusCode: 200,
            title: 'Dashboard Stats',
            message: 'Dashboard statistics retrieved successfully.',
            data: { stats },
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return JsonResponse(res, {
            status: 'error',
            statusCode: 500,
            title: 'Server Error',
            message: 'Failed to fetch dashboard statistics.',
        });
    }
};
