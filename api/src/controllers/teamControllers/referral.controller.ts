import crypto from "crypto";
import models from "../../models";

// Generate unique referral code
export const generateReferralCode = async (): Promise<string> => {
    let code: string = "";
    let exists = true;

    while (exists) {
        code = crypto.randomBytes(4).toString("hex").toUpperCase(); // 8 chars
        const user = await models.User.findOne({ referralCode: code });
        exists = !!user;
    }

    return code;
};

// Process referral chain (Create Level A, B, C referrals)
export const processReferralChain = async (newUserId: any, referrerId: any) => {
    try {
        const newUser = await models.User.findById(newUserId);
        const referrer = await models.User.findById(referrerId);

        if (!newUser || !referrer) return;

        // Level A
        await models.TeamReferral.create({
            userId: referrerId,
            referredUserId: newUserId,
            level: "A",
            referralChain: [referrerId, newUserId],
        });

        await models.TeamReferralHistory.create({
            userId: referrerId,
            referredUserId: newUserId,
            referrerUserId: referrerId,
            level: "A",
            amount: 0,
            transactionType: "signup_bonus",
            status: "pending",
            description: `${newUser.name} joined using your referral code.`,
            referralChain: [referrerId, newUserId],
        });

        // Update direct referrals count for direct referrer
        await models.User.findByIdAndUpdate(referrerId, {
            $inc: { directReferralsCount: 1, totalReferrals: 1 },
        });

        // Level B
        const levelAReferrer = await models.TeamReferral.findOne({
            referredUserId: referrerId,
            level: "A",
        });

        if (levelAReferrer) {
            const levelBReferrerId = levelAReferrer.userId;
            await models.TeamReferral.create({
                userId: levelBReferrerId,
                referredUserId: newUserId,
                level: "B",
                referralChain: [levelBReferrerId, referrerId, newUserId],
            });

            await models.TeamReferralHistory.create({
                userId: levelBReferrerId,
                referredUserId: newUserId,
                referrerUserId: referrerId,
                level: "B",
                amount: 0,
                transactionType: "signup_bonus",
                status: "pending",
                description: `${newUser.name} joined via ${referrer.name} (Level B).`,
                referralChain: [levelBReferrerId, referrerId, newUserId],
            });

            await models.User.findByIdAndUpdate(levelBReferrerId, {
                $inc: { totalReferrals: 1 },
            });

            // Level C
            const levelBReferrer = await models.TeamReferral.findOne({
                referredUserId: levelBReferrerId,
                level: "A",
            });

            if (levelBReferrer) {
                const levelCReferrerId = levelBReferrer.userId;
                await models.TeamReferral.create({
                    userId: levelCReferrerId,
                    referredUserId: newUserId,
                    level: "C",
                    referralChain: [levelCReferrerId, levelBReferrerId, referrerId, newUserId],
                });

                await models.TeamReferralHistory.create({
                    userId: levelCReferrerId,
                    referredUserId: newUserId,
                    referrerUserId: referrerId,
                    level: "C",
                    amount: 0,
                    transactionType: "signup_bonus",
                    status: "pending",
                    description: `${newUser.name} joined via the network (Level C).`,
                    referralChain: [levelCReferrerId, levelBReferrerId, referrerId, newUserId],
                });

                await models.User.findByIdAndUpdate(levelCReferrerId, {
                    $inc: { totalReferrals: 1 },
                });
            }
        }
    } catch (error) {
        console.error("Error processing referral chain:", error);
    }
};

// Process commissions on level purchase
export const processReferralCommissions = async (userId: any, purchasedLevel: any) => {
    try {
        const pendingReferrals = await models.TeamReferralHistory.find({
            referredUserId: userId,
            status: "pending",
        });

        for (const referral of pendingReferrals) {
            let rate = 0;
            if (referral.level === "A") rate = purchasedLevel.aLevelCommissionRate || 0;
            else if (referral.level === "B") rate = purchasedLevel.bLevelCommissionRate || 0;
            else if (referral.level === "C") rate = purchasedLevel.cLevelCommissionRate || 0;

            if (rate > 0) {
                const commissionAmount = (purchasedLevel.investmentAmount * rate) / 100;

                // Update referrer's wallet
                const referrerUser = await models.User.findById(referral.userId);
                if (referrerUser) {
                    referrerUser.mainWallet = (referrerUser.mainWallet || 0) + commissionAmount;
                    await referrerUser.save();

                    // Update Referral History
                    referral.status = "completed";
                    referral.amount = commissionAmount;
                    referral.transactionType = "investment_commission";
                    referral.investmentAmount = purchasedLevel.investmentAmount;
                    referral.commissionPercentage = rate;
                    referral.description = `Earned ₹${commissionAmount.toFixed(2)} commission from ${referral.level}-level referral (${purchasedLevel.levelName}) purchase.`;
                    await referral.save();

                    // Update TeamReferral total earnings
                    await models.TeamReferral.findOneAndUpdate(
                        { userId: referral.userId, referredUserId: userId },
                        { $inc: { totalEarnings: commissionAmount } }
                    );
                }
            } else {
                // If no commission for this level, just mark as completed with 0
                referral.status = "completed";
                await referral.save();
            }
        }
    } catch (error) {
        console.error("Error processing referral commissions:", error);
    }
};

export default {
    generateReferralCode,
    processReferralChain,
    processReferralCommissions
};
