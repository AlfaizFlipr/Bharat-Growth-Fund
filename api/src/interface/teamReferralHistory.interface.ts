import { Document, ObjectId } from "mongoose";

export interface ITeamReferralHistory extends Document {
    userId: ObjectId;
    referredUserId: ObjectId;
    referrerUserId: ObjectId;
    level: 'A' | 'B' | 'C';
    amount: number;
    transactionType: "signup_bonus" | "investment_commission";
    status: "pending" | "completed" | "cancelled";
    description: string;
    referralChain: ObjectId[];
    investmentAmount?: number;
    commissionPercentage?: number;
    createdAt: Date;
    updatedAt: Date;
}
