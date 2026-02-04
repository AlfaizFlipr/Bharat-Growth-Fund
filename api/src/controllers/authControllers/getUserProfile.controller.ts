import { Request, Response, NextFunction } from 'express';
import commonsUtils from '../../utils';
import models from '../../models';
import { jwtConfig } from '../../services';

const { JsonResponse } = commonsUtils;

const getStartOfTodayIST = (): Date => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  istTime.setUTCHours(0, 0, 0, 0);
  return new Date(istTime.getTime() - istOffset);
};

const getStartOfThisMonthIST = (): Date => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  istTime.setUTCDate(1);
  istTime.setUTCHours(0, 0, 0, 0);
  return new Date(istTime.getTime() - istOffset);
};

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.userAuth;
    if (!token) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 401,
        title: 'Unauthorized',
        message: 'No token provided',
      });
    }

    const decoded = jwtConfig.jwtService.verifyJWT(token);
    if (!decoded?.id) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 401,
        title: 'Unauthorized',
        message: 'Invalid token',
      });
    }

    const user = await models.User.findById(decoded.id).select('-password');
    if (!user) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        title: 'Not Found',
        message: 'User not found',
      });
    }

    if (user.currentLevelNumber !== undefined && user.currentLevelNumber >= 0 && !user.dailyIncome) {
      const userLevel = await models.level.findOne({
        levelNumber: user.currentLevelNumber,
        isActive: true
      });
      if (userLevel) {
        user.dailyIncome = userLevel.dailyIncome;
        await user.save();
      }
    }

    
    const pendingWithdrawals = await models.withdrawal.aggregate([
      { $match: { userId: user._id, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const pendingWithdrawalAmount = pendingWithdrawals.length > 0 ? pendingWithdrawals[0].total : 0;

    const totalRevenue = user.totalRevenue || 0;

    res.locals.userId = user._id;


    const startOfToday = getStartOfTodayIST();
    const needsDailyReset = user.lastTaskCompletedAt &&
      new Date(user.lastTaskCompletedAt) < startOfToday;

    if (needsDailyReset) {
      const alreadyResetToday = user.lastIncomeResetDate &&
        new Date(user.lastIncomeResetDate) >= startOfToday;

      if (!alreadyResetToday && (user.todayIncome > 0 || user.todayTasksCompleted > 0)) {
        user.todayIncome = 0;
        user.todayTasksCompleted = 0;
        user.lastIncomeResetDate = new Date();
        await user.save();
      }
    }


    const startOfThisMonth = getStartOfThisMonthIST();
    const needsMonthlyReset = user.lastMonthlyResetDate &&
      new Date(user.lastMonthlyResetDate) < startOfThisMonth;

    if (needsMonthlyReset && user.monthlyIncome > 0) {
      user.monthlyIncome = 0;
      user.lastMonthlyResetDate = new Date();
      await user.save();
    }

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Profile Retrieved',
      message: 'User profile fetched successfully',
      data: {
        user,
        stats: {
          todayIncome: user.todayIncome || 0,
          monthlyIncome: user.monthlyIncome || 0,
          totalRevenue: totalRevenue,
          totalWithdrawals: user.totalWithdrawals || 0,
          pendingWithdrawals: pendingWithdrawalAmount,
          mainWallet: user.mainWallet || 0,
          commissionWallet: user.commissionWallet || 0,
          todayTasksCompleted: user.todayTasksCompleted || 0,
        },
      },
    });
  } catch (err) {
    console.error('❌ Error in verifyUser middleware:', err);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      title: 'Server Error',
      message: 'Failed to fetch profile',
    });
  }
};
