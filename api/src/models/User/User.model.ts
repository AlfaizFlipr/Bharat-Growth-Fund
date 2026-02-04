
import { Schema, model } from 'mongoose';
import commonsUtils from '../../utils';
import { IUser, IUserMethods } from '../../interface/user.interface';

const schema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    plainPassword: { type: String, select: false },
    picture: { type: String },
    mainWallet: { type: Number, default: 0, min: 0 },

    todayIncome: { type: Number, default: 0 },

    monthlyIncome: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalWithdrawals: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 },
    withdrawalPassword: { type: String, select: false },
    investmentAmount: { type: Number, default: 0, min: 0 },
    levelUpgradedAt: { type: Date, default: null },
    userLevel: { type: Number, default: -1 },
    currentLevelNumber: { type: Number, default: -1 },
    currentLevel: { type: String, default: null },
    levelName: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isSSO: { type: Boolean, default: false },
    
    isUSDUser: { type: Boolean, default: false },
    lastActiveDate: { type: Date, default: null },
    lastIncomeResetDate: { type: Date, default: Date.now },
    lastMonthlyResetDate: { type: Date, default: Date.now },

    aadhaarNumber: { type: String, default: null, sparse: true },
    aadhaarPhoto: { type: String, default: null },
    aadhaarVerificationStatus: {
      type: String,
      enum: ['not_submitted', 'pending', 'approved', 'rejected'],
      default: 'not_submitted'
    },
    aadhaarSubmittedAt: { type: Date, default: null },
    aadhaarVerifiedAt: { type: Date, default: null },
    aadhaarRejectionReason: { type: String, default: null },
  },
  { timestamps: true },
);

commonsUtils.dbUtils.handleDuplicates(schema, 'phone');


const userModel = model<IUser, IUserMethods>('user', schema);

export default userModel;
