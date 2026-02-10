import { Model } from "mongoose";

export interface ILevel extends Document {
  [key: string]: any;
  levelNumber: number;
  levelName: string;
  investmentAmount: number;
  dailyIncome: number;
  aLevelCommissionRate: number;
  bLevelCommissionRate: number;
  cLevelCommissionRate: number;
  isActive: boolean;
  order: number;
  icon: string;
  description: string;
}

export interface ILevelMethods extends Model<ILevel> { }
