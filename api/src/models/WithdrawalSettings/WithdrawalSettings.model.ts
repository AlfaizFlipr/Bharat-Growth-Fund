
import { Schema, model, Document } from 'mongoose';

export interface IWithdrawalSettings extends Document {
  
  stripeEnabled: boolean;
  bitgetEnabled: boolean;
  
  
  bitgetApiKey: string;
  bitgetSecretKey: string;
  bitgetPassphrase: string; 
  bitgetNetwork: string; 
  bitgetCurrency: string; 
  
  
  usdExchangeRate: number;
  autoUpdateExchangeRate: boolean;
  
  
  minWithdrawalINR: number;
  maxWithdrawalINR: number;
  
  
  stripeFeePercent: number;
  bitgetFeePercent: number;
  
  
  defaultWithdrawalMethod: 'stripe' | 'bitget';
  
  
  notes: string;
  
  updatedBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawalSettingsSchema = new Schema<IWithdrawalSettings>(
  {
    stripeEnabled: {
      type: Boolean,
      default: false, 
    },
    bitgetEnabled: {
      type: Boolean,
      default: true, 
    },
    bitgetApiKey: {
      type: String,
      default: '',
    },
    bitgetSecretKey: {
      type: String,
      default: '',
    },
    bitgetPassphrase: {
      type: String,
      default: '', 
    },
    bitgetNetwork: {
      type: String,
      default: 'trc20', 
      enum: ['trc20', 'bep20', 'erc20', 'sol', 'matic'],
    },
    bitgetCurrency: {
      type: String,
      default: 'USDT',
      enum: ['USDT', 'USDC'],
    },
    usdExchangeRate: {
      type: Number,
      default: 83, 
    },
    autoUpdateExchangeRate: {
      type: Boolean,
      default: false,
    },
    minWithdrawalINR: {
      type: Number,
      default: 0.01, 
    },
    maxWithdrawalINR: {
      type: Number,
      default: 500000,
    },
    stripeFeePercent: {
      type: Number,
      default: 2.9, 
    },
    bitgetFeePercent: {
      type: Number,
      default: 0.1, 
    },
    defaultWithdrawalMethod: {
      type: String,
      enum: ['stripe', 'bitget'],
      default: 'bitget', 
    },
    notes: {
      type: String,
      default: '',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  { timestamps: true }
);

const WithdrawalSettingsModel = model<IWithdrawalSettings>('withdrawalsettings', withdrawalSettingsSchema);

export default WithdrawalSettingsModel;
