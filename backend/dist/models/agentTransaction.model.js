"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Model lịch sử giao dịch của đại lý
const mongoose_1 = __importDefault(require("mongoose"));
const AgentTransactionSchema = new mongoose_1.default.Schema({
    agentId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Agent', required: true }, // Đại lý thực hiện giao dịch
    orderId: { type: String, required: true }, // Mã đơn hàng duy nhất
    accountId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Account' }, // Tài khoản đã thuê
    price: { type: Number, required: true }, // Số tiền giao dịch
    status: { type: String, enum: ['PAID', 'FAILED'], required: true }, // Trạng thái giao dịch
    createdAt: { type: Date, default: Date.now }, // Thời gian tạo giao dịch
    expiredAt: { type: Date }, // Thời gian hết hạn thuê
    // Thông tin tài khoản thuê (lưu lại để truy xuất nhanh)
    username: { type: String },
    password: { type: String },
    // Loại giao dịch (thuê, nạp, hoàn tiền... nếu cần mở rộng)
    type: { type: String, default: 'rent' },
    // Số dư còn lại sau giao dịch
    balanceAfter: { type: Number },
});
exports.default = mongoose_1.default.model('AgentTransaction', AgentTransactionSchema);
