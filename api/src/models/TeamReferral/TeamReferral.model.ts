import { Schema, model } from 'mongoose';
import { ITeamReferral } from '../../interface/teamReferral.interface';

const teamReferralSchema = new Schema<ITeamReferral>(
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
        level: { type: String, enum: ['A', 'B', 'C'], required: true },
        referralChain: [{ type: Schema.Types.ObjectId, ref: 'user' }],
        isActive: { type: Boolean, default: true },
        totalEarnings: { type: Number, default: 0 },
    },
    { timestamps: true },
);

teamReferralSchema.index({ userId: 1, level: 1 });
teamReferralSchema.index({ referredUserId: 1 });

const TeamReferral = model<ITeamReferral>('TeamReferral', teamReferralSchema);
export default TeamReferral;
