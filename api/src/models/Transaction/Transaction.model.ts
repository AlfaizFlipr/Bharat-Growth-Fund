import { Schema, model, Document } from 'mongoose';

export interface ITransaction extends Document {
    userId: Schema.Types.ObjectId;
    amount: number;
    type: 'RECHARGE' | 'WITHDRAWAL' | 'LEVEL_PURCHASE' | 'DAILY_INCOME';
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    description?: string;
    referenceId?: string; 
    balanceBefore?: number;
    balanceAfter?: number;
    createdAt: Date;
    updatedAt: Date;
}

const schema = new Schema<ITransaction>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            enum: ['RECHARGE', 'WITHDRAWAL', 'LEVEL_PURCHASE', 'DAILY_INCOME'],
            required: true,
        },
        status: {
            type: String,
            enum: ['PENDING', 'SUCCESS', 'FAILED'],
            default: 'PENDING',
        },
        description: {
            type: String,
        },
        referenceId: {
            type: String,
        },
        balanceBefore: {
            type: Number,
        },
        balanceAfter: {
            type: Number,
        },
    },
    { timestamps: true }
);


schema.index({ userId: 1, createdAt: -1 });

const TransactionModel = model<ITransaction>('transaction', schema);

export default TransactionModel;
