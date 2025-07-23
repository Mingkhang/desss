import mongoose, { Schema, Document } from 'mongoose';

export type AccountStatus = 'available' | 'rented' | 'waiting' | 'updating' | 'paused';

export interface IAccount extends Document {
  username: string;
  password?: string;
  displayOrder: number;
  status: AccountStatus;
  rentedAt?: Date;
  expiresAt?: Date;
  currentTransactionId?: mongoose.Types.ObjectId;
}

const AccountSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    displayOrder: { type: Number, required: true, index: true },
    status: {
      type: String,
      enum: ['available', 'rented', 'waiting', 'updating', 'paused'],
      default: 'available',
    },
    rentedAt: { type: Date },
    expiresAt: { type: Date },
    currentTransactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
  },
  { timestamps: true }
);

const Account = mongoose.model<IAccount>('Account', AccountSchema);
export default Account;