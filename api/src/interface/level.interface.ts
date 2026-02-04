import { Model } from "mongoose";

export interface ILevel extends Document {
  [key: string]: any;
  levelNumber: number;
  levelName: string;
  investmentAmount: number; 
  dailyIncome: number; 

  isActive: boolean;
  order: number;
  icon: string;
  description: string;
}

export interface ILevelMethods extends Model<ILevel> { }
