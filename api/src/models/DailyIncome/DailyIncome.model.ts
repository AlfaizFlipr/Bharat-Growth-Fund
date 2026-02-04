import { Schema, model, Document } from 'mongoose';

export interface IDailyIncome extends Document {
    userId: Schema.Types.ObjectId;
    levelId: Schema.Types.ObjectId;
    amount: number;
    date: Date;
    status: 'PENDING' | 'CREDITED' | 'FAILED';
    createdAt: Date;
    updatedAt: Date;
}

const schema = new Schema<IDailyIncome>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        levelId: {
            type: Schema.Types.ObjectId,
            ref: 'level',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        date: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['PENDING', 'CREDITED', 'FAILED'],
            default: 'PENDING',
        },
    },
    { timestamps: true }
);


schema.index({ userId: 1, date: 1 }, { unique: true });

const DailyIncomeModel = model<IDailyIncome>('dailyIncome', schema);

export default DailyIncomeModel;
