import mongoose, { Schema, Document } from 'mongoose';

export interface ISetting extends Document {
  paymentDescriptionCounter: number;
  bannerContent: { message: string; fontSize: number; isEnabled: boolean; };
  rentalPrices: Map<string, { duration: number; price: number; }>;
  monthlyRevenue: number;
}

const SettingSchema: Schema = new Schema(
  {
    paymentDescriptionCounter: { type: Number, default: 0 },
    bannerContent: {
      message: { type: String, default: 'Chào mừng đến với Thuetool.online!' },
      fontSize: { type: Number, default: 16 },
      isEnabled: { type: Boolean, default: true },
    },
    rentalPrices: {
      type: Map,
      of: new Schema({
        duration: { type: Number, required: true },
        price: { type: Number, required: true },
      }),
      default: {
        '6h': { duration: 6, price: 16000 },
        '12h': { duration: 12, price: 22000 },
        '18h': { duration: 18, price: 20000 },
        '24h': { duration: 24, price: 32000 },
        '48h': { duration: 48, price: 40000 },
        '72h': { duration: 72, price: 72000 },
        '120h': { duration: 120, price: 70000 },
        '168h': { duration: 168, price: 102000 },
      },
    },
    monthlyRevenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Setting = mongoose.model<ISetting>('Setting', SettingSchema);
export default Setting;