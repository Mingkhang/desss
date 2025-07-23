import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
  username: string;
  password?: string; // Mật khẩu là optional vì ta không trả về nó trong các API thông thường
  comparePassword(password: string): Promise<boolean>;
}

const AdminSchema: Schema = new Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
  },
  password: { 
    type: String, 
    required: true, 
    select: false,
  },
});

// Middleware (hook) của Mongoose: Tự động băm mật khẩu khi lưu
AdminSchema.pre<IAdmin>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    if (error instanceof Error) {
        next(error);
    } else {
        next(new Error('An unknown error occurred during password hashing'));
    }
  }
});

/**
 * Phương thức tùy chỉnh để so sánh mật khẩu nhập vào với mật khẩu đã được băm trong DB.
 */
AdminSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  // **ĐÂY LÀ PHẦN SỬA LỖI: Xóa bỏ .lean()**
  // Câu truy vấn bây giờ sẽ trả về một document Mongoose đầy đủ, giúp TypeScript hiểu đúng kiểu dữ liệu.
  const adminWithPassword = await mongoose.model('Admin').findOne({ _id: this._id }).select('+password');
  
  if (!adminWithPassword || !adminWithPassword.password) {
    return false;
  }
  
  return bcrypt.compare(password, adminWithPassword.password);
};

const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;