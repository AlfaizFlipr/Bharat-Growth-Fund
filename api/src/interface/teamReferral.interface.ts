import { Document, ObjectId } from "mongoose";

export interface ITeamReferral extends Document {
    userId: ObjectId;
    referredUserId: ObjectId;
    level: 'A' | 'B' | 'C';
    referralChain: ObjectId[];
    isActive: boolean;
    totalEarnings: number;
    createdAt: Date;
    updatedAt: Date;
}
