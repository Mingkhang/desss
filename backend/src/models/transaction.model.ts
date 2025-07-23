// File: src/models/transaction.model.ts
import mongoose, { Schema, Document } from 'mongoose';

// CẢI TIẾN: Thêm trạng thái FAILED
export type TransactionStatus = 'CREATED' | 'PAID' | 'CANCELLED' | 'EXPIRED' | 'FAILED';

export interface ITransaction extends Document {
  orderCode: number;
  accountId?: mongoose.Types.ObjectId;
  rentalPackageKey: string;
  rentalDurationInMinutes: number;
  amount: number;
  discountAmount: number;
  finalAmount: number;
  status: TransactionStatus;
  voucherCode?: string;
  socketId?: string;
  newVoucherId?: mongoose.Types.ObjectId; // Thêm dòng này
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    orderCode: { type: Number, required: true, unique: true, index: true },
    accountId: { type: Schema.Types.ObjectId, ref: 'Account' },
    rentalPackageKey: { type: String, required: true },
    rentalDurationInMinutes: { type: Number, required: true },
    amount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    status: { type: String, enum: ['CREATED', 'PAID', 'CANCELLED', 'EXPIRED', 'FAILED'], default: 'CREATED' },
    voucherCode: { type: String },
    socketId: { type: String },
    newVoucherId: { type: Schema.Types.ObjectId, ref: 'Voucher', default: null }, // Thêm dòng này
  },
  { timestamps: true }
);

const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
export default Transaction;