import { Schema, model } from "mongoose";
import { ILevel, ILevelMethods } from "../../interface/level.interface";

const schema = new Schema<ILevel>(
  {
    levelNumber: {
      type: Number,
      required: true,
      unique: true,

    },
    levelName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    investmentAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    dailyIncome: {
      type: Number,
      required: true,
      min: 0,
    },
    aLevelCommissionRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    bLevelCommissionRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    cLevelCommissionRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    icon: {
      type: String,
      default: '💰',
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

schema.index({ levelNumber: 1, isActive: 1 });
schema.index({ order: 1 });

const levelModel: ILevelMethods = model<ILevel, ILevelMethods>("level", schema);

export default levelModel;