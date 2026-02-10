import { Request, Response, NextFunction } from "express";
import commonsUtils from "../../utils";
import models from "../../models";
import mongoose from "mongoose";
import referralController from "../teamControllers/referral.controller";

const { JsonResponse } = commonsUtils;




export const getAllLevels = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;

    const levels = await models.level
      .find({ isActive: true })
      .sort({ order: 1, levelNumber: 1 })
      .lean();

    let userCurrentLevel = null;

    if (userId) {
      const user = await models.User.findById(userId).select(
        "currentLevel currentLevelNumber investmentAmount mainWallet"
      );

      if (user) {
        userCurrentLevel = {
          currentLevel: user.currentLevel,
          currentLevelNumber: user.currentLevelNumber,
          investmentAmount: user.investmentAmount || 0,
          mainWallet: user.mainWallet || 0,
          hasLevel: user.currentLevel !== null && user.currentLevel !== undefined,
        };
      }
    }

    const formattedLevels = levels.map((level) => {
      const isUserLevel = userCurrentLevel?.currentLevelNumber === level.levelNumber;

      let canPurchase = false;
      if (userCurrentLevel) {
        if (userCurrentLevel.hasLevel) {

          canPurchase = level.levelNumber === userCurrentLevel.currentLevelNumber + 1 &&
            userCurrentLevel.mainWallet >= level.investmentAmount;
        } else {

          canPurchase = level.levelNumber === 0 && userCurrentLevel.mainWallet >= level.investmentAmount;
        }
      }

      const isUnlocked = userCurrentLevel?.hasLevel
        ? level.levelNumber <= userCurrentLevel.currentLevelNumber
        : false;

      return {
        level: level.levelName,
        levelNumber: level.levelNumber,
        purchasePrice: level.investmentAmount,
        dailyIncome: level.dailyIncome,
        icon: level.icon,
        description: level.description,
        aLevelCommissionRate: level.aLevelCommissionRate || 0,
        bLevelCommissionRate: level.bLevelCommissionRate || 0,
        cLevelCommissionRate: level.cLevelCommissionRate || 0,
        isUnlocked,
        isCurrent: isUserLevel,
        canPurchase,
      };
    });

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Levels",
      message: "Levels retrieved successfully.",
      data: {
        levels: formattedLevels,
        userLevel: userCurrentLevel,
        requiresLevelPurchase: userCurrentLevel ? !userCurrentLevel.hasLevel : true,
      },
    });
  } catch (error) {
    console.error("Error fetching levels:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while fetching levels.",
      title: "Levels",
    });
  }
};


export const upgradeUserLevel = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;
    const newLevelNumber = Number(req.body.newLevelNumber);

    if (!userId) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 401,
        message: "User not authenticated.",
        title: "Purchase Level",
      });
    }

    const user = await models.User.findById(userId);
    if (!user) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "User not found.",
        title: "Purchase Level",
      });
    }

    const targetLevel = await models.level.findOne({
      levelNumber: newLevelNumber,
      isActive: true,
    });

    if (!targetLevel) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: `Target level ${newLevelNumber} not found.`,
        title: "Purchase Level",
      });
    }

    if (user.mainWallet < targetLevel.investmentAmount) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: `Insufficient balance. Required: ₹${targetLevel.investmentAmount}, Available: ₹${user.mainWallet}`,
        title: "Purchase Level",
      });
    }

    user.mainWallet -= targetLevel.investmentAmount;
    user.investmentAmount = (user.investmentAmount || 0) + targetLevel.investmentAmount;
    user.currentLevel = targetLevel.levelName;
    user.currentLevelNumber = targetLevel.levelNumber;
    user.levelName = targetLevel.levelName;
    user.userLevel = targetLevel.levelNumber;
    user.dailyIncome = targetLevel.dailyIncome;
    user.levelUpgradedAt = new Date();

    await user.save();


    await models.transaction.create({
      userId: user._id,
      amount: targetLevel.investmentAmount,
      type: 'LEVEL_PURCHASE',
      status: 'SUCCESS',
      description: `Purchased ${targetLevel.levelName} (Level ${targetLevel.levelNumber})`,
      balanceBefore: user.mainWallet + targetLevel.investmentAmount,
      balanceAfter: user.mainWallet
    });

    // Process referral commissions
    try {
      await referralController.processReferralCommissions(user._id, targetLevel);
    } catch (err) {
      console.error("Error processing referral commissions:", err);
    }

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Purchase Level",
      message: `Successfully purchased ${targetLevel.levelName}! Your daily income is now ₹${targetLevel.dailyIncome}.`,
      data: {
        newLevel: targetLevel.levelName,
        levelNumber: targetLevel.levelNumber,
        investmentAmount: targetLevel.investmentAmount,
        dailyIncome: targetLevel.dailyIncome,
        remainingBalance: user.mainWallet,
        totalInvestment: user.investmentAmount,
      },
    });
  } catch (error) {
    console.error("Error purchasing level:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while purchasing level.",
      title: "Purchase Level",
    });
  }
};


export const getLevelByName = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { levelName } = req.params;

    const level = await models.level.findOne({
      levelName,
      isActive: true,
    });

    if (!level) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Level not found.",
        title: "Get Level",
      });
    }

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Get Level",
      message: "Level retrieved successfully.",
      data: { level },
    });
  } catch (error) {
    console.error("Error fetching level:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while fetching the level.",
      title: "Get Level",
    });
  }
};


export const getLevelByNumber = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { levelNumber } = req.params;

    const level = await models.level.findOne({
      levelNumber: Number(levelNumber),
      isActive: true,
    });

    if (!level) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Level not found.",
        title: "Get Level",
      });
    }

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Get Level",
      message: "Level retrieved successfully.",
      data: { level },
    });
  } catch (error) {
    console.error("Error fetching level:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while fetching the level.",
      title: "Get Level",
    });
  }
};




export const getAllLevelsAdmin = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      isActive = ""
    } = req.query;

    const pageNum = Number.parseInt(page as string, 10);
    const limitNum = Number.parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;


    const filter: any = {};

    if (search) {
      filter.$or = [
        { levelName: { $regex: search, $options: "i" } },
        { levelNumber: Number.isNaN(Number(search)) ? undefined : Number(search) }
      ].filter(Boolean);
    }

    if (isActive !== "" && isActive !== "all") {
      filter.isActive = isActive === "true";
    }


    const [levels, totalCount] = await Promise.all([
      models.level.find(filter)
        .sort({ order: 1, levelNumber: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      models.level.countDocuments(filter)
    ]);


    const stats = await models.level.aggregate([
      {
        $group: {
          _id: null,
          totalLevels: { $sum: 1 },
          activeLevels: {
            $sum: { $cond: ["$isActive", 1, 0] }
          },
          totalInvestment: { $sum: "$investmentAmount" }
        }
      }
    ]);


    const userStats = await models.User.aggregate([
      {
        $group: {
          _id: "$currentLevelNumber",
          count: { $sum: 1 }
        }
      }
    ]);


    const levelsWithUserCount = levels.map((level: any) => {
      const userStat = userStats.find((s: any) => s._id === level.levelNumber);
      return {
        ...level,
        userCount: userStat?.count || 0
      };
    });

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Levels Retrieved",
      message: "Levels fetched successfully.",
      data: {
        levels: levelsWithUserCount,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
          limit: limitNum
        },
        statistics: {
          ...stats[0],
          totalUsers: userStats.reduce((acc: number, curr: any) => acc + curr.count, 0)
        }
      }
    });
  } catch (err) {
    console.error("💥 Get all levels error:", err);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      title: "Server Error",
      message: "Failed to fetch levels.",
    });
  }
};


export const createLevel = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const {
      levelNumber,
      levelName,
      investmentAmount,
      dailyIncome,
      aLevelCommissionRate,
      bLevelCommissionRate,
      cLevelCommissionRate,
      icon,
      description,
      order,
    } = req.body;


    if (levelNumber === undefined || !levelName || dailyIncome === undefined) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Level number, name, and daily income are required.",
        title: "Create Level",
      });
    }


    const existingLevel = await models.level.findOne({
      $or: [{ levelNumber }, { levelName }],
    });

    if (existingLevel) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Level with this number or name already exists.",
        title: "Create Level",
      });
    }

    const level = await models.level.create({
      levelNumber,
      levelName,
      investmentAmount: investmentAmount || 0,
      dailyIncome,
      aLevelCommissionRate: aLevelCommissionRate || 0,
      bLevelCommissionRate: bLevelCommissionRate || 0,
      cLevelCommissionRate: cLevelCommissionRate || 0,
      icon: icon || '💰',
      description: description || '',
      order: order ?? levelNumber,
      isActive: true,
    });

    return JsonResponse(res, {
      status: "success",
      statusCode: 201,
      title: "Create Level",
      message: "Level created successfully.",
      data: { level },
    });
  } catch (error: any) {
    console.error("Error creating level:", error);

    if (error.code === 11000) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Level with this number or name already exists.",
        title: "Create Level",
      });
    }

    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while creating the level.",
      title: "Create Level",
    });
  }
};


export const updateLevel = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { levelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(levelId)) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Invalid level ID.",
        title: "Update Level",
      });
    }

    const level = await models.level.findById(levelId);

    if (!level) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Level not found.",
        title: "Update Level",
      });
    }

    const allowedUpdates = [
      "investmentAmount",
      "dailyIncome",
      "icon",
      "description",
      "order",
      "isActive",
      "aLevelCommissionRate",
      "bLevelCommissionRate",
      "cLevelCommissionRate",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        (level as any)[field] = req.body[field];
      }
    });

    await level.save();

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Update Level",
      message: "Level updated successfully.",
      data: { level },
    });
  } catch (error) {
    console.error("Error updating level:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while updating the level.",
      title: "Update Level",
    });
  }
};


export const deleteLevel = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { levelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(levelId)) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Invalid level ID.",
        title: "Delete Level",
      });
    }

    const level = await models.level.findById(levelId);

    if (!level) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Level not found.",
        title: "Delete Level",
      });
    }


    const usersCount = await models.User.countDocuments({
      currentLevelNumber: level.levelNumber
    });

    if (usersCount > 0) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: `Cannot delete level. ${usersCount} users are currently using this level.`,
        title: "Delete Level",
      });
    }

    await models.level.findByIdAndDelete(levelId);

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Delete Level",
      message: "Level deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting level:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while deleting the level.",
      title: "Delete Level",
    });
  }
};

export default {

  getAllLevels,
  getLevelByName,
  getLevelByNumber,
  upgradeUserLevel,


  getAllLevelsAdmin,
  createLevel,
  updateLevel,
  deleteLevel,
};