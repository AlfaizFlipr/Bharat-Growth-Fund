import mongoose, { Schema, Document } from "mongoose";

export interface IRewardHistory extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  runAt: Date;
  runKey: string; // unique key for the run to avoid duplicates
}

const rewardHistorySchema = new Schema<IRewardHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    runAt: { type: Date, required: true },
    runKey: { type: String, required: true },
  },
  { timestamps: true }
);

rewardHistorySchema.index({ userId: 1, runKey: 1 }, { unique: true });

export default mongoose.model<IRewardHistory>("RewardHistory", rewardHistorySchema);
