import { Document, Model, ObjectId, Query } from "mongoose";
export interface IUser extends Document {
  [key: string]: any;
  _id: ObjectId;
  id: string;
  name: string;
  phone: string;
  password: string;
  plainPassword: string;
  username: string;
  picture?: string;
  mainWallet: number;
  todayIncome: number;
  monthlyIncome: number;
  totalRevenue: number;
  totalWithdrawals: number;
  totalProfit: number;
  commissionWallet: number;
  todayTasksCompleted: number;
  currentLevel: string;
  currentLevelNumber: number;
  investmentAmount: number;
  levelUpgradedAt?: Date;
  userLevel: number;
  levelName: string;
  isActive: boolean;
  isVerified: boolean;
  isSSO: boolean;
  isUSDUser: boolean;
  lastActiveDate?: Date | null;
  lastIncomeResetDate: Date;
  lastMonthlyResetDate: Date;
  createdAt: Date;
  updatedAt: Date;
  withdrawalPassword: string;
  referralCode: string;
  referredBy?: ObjectId;
  totalReferrals: number;
  directReferralsCount: number;
  aadhaarNumber?: string | null;
  aadhaarPhoto?: string | null;
  aadhaarVerificationStatus: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  aadhaarSubmittedAt?: Date | null;
  aadhaarVerifiedAt?: Date | null;
  aadhaarRejectionReason?: string | null;
}

type TQueryType = Query<IUser, IUser>;

export interface IUserMethods extends Model<IUser> {
  createUser(user: Pick<IUser, "name" | "password">): TQueryType;
  getById(id: IUser["id"]): TQueryType;
  updatePassword(data: {
    id: IUser["id"];
    password: IUser["password"];
  }): TQueryType;
}
