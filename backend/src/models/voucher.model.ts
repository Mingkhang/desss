import mongoose, { Schema, Document } from 'mongoose';

export interface IVoucher extends Document {
  code: string;
  discountAmount: number;
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
}

const VoucherSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    discountAmount: { type: Number, required: true },
    isUsed: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const Voucher = mongoose.model<IVoucher>('Voucher', VoucherSchema);
export default Voucher;