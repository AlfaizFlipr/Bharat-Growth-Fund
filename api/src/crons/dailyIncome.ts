import cron from "node-cron";
import models from "../models";

export const initDailyIncome = () => {
    cron.schedule(
        "59 23 * * *",
        async () => {
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const users = await models.User.find({
                    currentLevelNumber: { $gte: 0 }, 
                    isActive: true
                });

                if (users.length === 0) {
                    return;
                }

                let processedCount = 0;
                let errorCount = 0;

                for (const user of users) {
                    try {
                        const level = await models.level.findOne({ levelNumber: user.currentLevelNumber });

                        if (!level || level.dailyIncome <= 0) {
                            continue;
                        }

                        const existingIncome = await models.dailyIncome.findOne({
                            userId: user._id,
                            date: {
                                $gte: today,
                                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                            }
                        });


                        if (existingIncome) {
                            continue; 
                        }

                        
                        

                        
                        const previousBalance = user.mainWallet;
                        user.mainWallet += level.dailyIncome;
                        user.todayIncome = level.dailyIncome; 
                        user.totalRevenue += level.dailyIncome;
                        user.totalProfit += level.dailyIncome;
                        await user.save();

                        
                        await models.dailyIncome.create({
                            userId: user._id,
                            levelId: level._id,
                            amount: level.dailyIncome,
                            date: new Date(),
                            status: 'CREDITED'
                        });

                        
                        await models.transaction.create({
                            userId: user._id,
                            amount: level.dailyIncome,
                            type: 'DAILY_INCOME',
                            status: 'SUCCESS',
                            description: `Daily income for Level ${level.levelNumber} (${level.levelName})`,
                            balanceBefore: previousBalance,
                            balanceAfter: user.mainWallet
                        });

                        processedCount++;
                    } catch (error_) {
                        console.error(`❌ Error processing daily income for user ${user._id.toString()}:`, error_);
                        errorCount++;
                    }
                }

            } catch (err) {
                console.error("❌ Critical error in daily income cron:", err);
            }
        },
        {
            timezone: "Asia/Kolkata",
        }
    );

};

export const initMonthlyReset = () => {
    cron.schedule(
        "1 0 1 * *",
        async () => {
            try {
                const result = await models.User.updateMany(
                    {},
                    { $set: { monthlyIncome: 0 } }
                );
            } catch (err) {
                console.error("❌ Failed to reset monthly income:", err);
            }
        },
        {
            timezone: "Asia/Kolkata",
        }
    );

    console.log("✅ Monthly income reset cron job initialized (runs on 1st of every month)");
};
