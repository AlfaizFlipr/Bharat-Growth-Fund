
import mongoose, { Schema, Document } from 'mongoose';

export interface IWithdrawal extends Document {
  userId: mongoose.Types.ObjectId;
  walletType: 'mainWallet' | 'commissionWallet';
  amount: number;
  bankAccountId?: mongoose.Types.ObjectId; 
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountType?: 'savings' | 'current' | 'qr';
  qrCodeImage?: string; 
  isUSDWithdrawal?: boolean; 
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  transactionId?: string;
  remarks?: string;
  createdAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

const WithdrawalSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      index: true,
    },
    walletType: {
      type: String,
      enum: ['mainWallet', 'commissionWallet'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 280,
    },
    bankAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankAccount',
      required: false, 
    },
    accountHolderName: {
      type: String,
      required: false, 
    },
    bankName: {
      type: String,
      required: false, 
    },
    accountNumber: {
      type: String,
      required: false, 
    },
    ifscCode: {
      type: String,
      required: false, 
      uppercase: true,
    },
    accountType: {
      type: String,
      enum: ['savings', 'current', 'qr'],
      default: 'savings',
    },
    qrCodeImage: {
      type: String,
      default: null,
    },
    isUSDWithdrawal: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'rejected'],
      default: 'pending',
      index: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);


WithdrawalSchema.index({ userId: 1, status: 1 });
WithdrawalSchema.index({ status: 1, createdAt: -1 });


WithdrawalSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'completed') {
    this.completedAt = new Date();
  }
  next();
});

export default mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema);