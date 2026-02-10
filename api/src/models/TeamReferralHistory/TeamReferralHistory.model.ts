import { Schema, model } from 'mongoose';
import { ITeamReferralHistory } from '../../interface/teamReferralHistory.interface';

const teamReferralHistorySchema = new Schema<ITeamReferralHistory>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
            index: true,
        },
        referredUserId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        referrerUserId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        level: { type: String, enum: ['A', 'B', 'C'], required: true },
        amount: { type: Number, default: 0 },
        transactionType: {
            type: String,
            enum: ["signup_bonus", "investment_commission"],
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "completed", "cancelled"],
            default: "pending"
        },
        description: { type: String },
        referralChain: [{ type: Schema.Types.ObjectId, ref: 'user' }],
        investmentAmount: { type: Number },
        commissionPercentage: { type: Number },
    },
    { timestamps: true },
);

teamReferralHistorySchema.index({ userId: 1, createdAt: -1 });
teamReferralHistorySchema.index({ referredUserId: 1 });

const TeamReferralHistory = model<ITeamReferralHistory>('TeamReferralHistory', teamReferralHistorySchema);
export default TeamReferralHistory;
