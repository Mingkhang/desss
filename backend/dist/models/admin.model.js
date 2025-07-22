"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const AdminSchema = new mongoose_1.Schema({
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
AdminSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            next(error);
        }
        else {
            next(new Error('An unknown error occurred during password hashing'));
        }
    }
});
/**
 * Phương thức tùy chỉnh để so sánh mật khẩu nhập vào với mật khẩu đã được băm trong DB.
 */
AdminSchema.methods.comparePassword = async function (password) {
    // **ĐÂY LÀ PHẦN SỬA LỖI: Xóa bỏ .lean()**
    // Câu truy vấn bây giờ sẽ trả về một document Mongoose đầy đủ, giúp TypeScript hiểu đúng kiểu dữ liệu.
    const adminWithPassword = await mongoose_1.default.model('Admin').findOne({ _id: this._id }).select('+password');
    if (!adminWithPassword || !adminWithPassword.password) {
        return false;
    }
    return bcryptjs_1.default.compare(password, adminWithPassword.password);
};
const Admin = mongoose_1.default.model('Admin', AdminSchema);
exports.default = Admin;
