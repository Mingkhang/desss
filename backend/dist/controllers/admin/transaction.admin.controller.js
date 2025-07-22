"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTransactions = void 0;
const transaction_model_1 = __importDefault(require("../../models/transaction.model"));
// Lấy tất cả giao dịch (không giới hạn, không đếm)
const getAllTransactions = async (req, res, next) => {
    try {
        // SỬA: Lấy ALL transactions không có limit, sort theo _id để đảm bảo lấy hết
        const transactions = await transaction_model_1.default.find({})
            .populate({
            path: 'accountId',
            select: 'username displayOrder'
        })
            .sort({ _id: -1 }) // Sort by _id thay vì createdAt
            .maxTimeMS(60000); // 60 seconds timeout
        // 🔍 DEBUG: Log backend data
        console.log('🔍 BACKEND - Total transactions found:', transactions.length);
        const statusCount = transactions.reduce((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
        }, {});
        console.log('🔍 BACKEND - Status count:', statusCount);
        const paidTransactions = transactions.filter(t => t.status === 'PAID');
        console.log('💰 BACKEND - PAID transactions count:', paidTransactions.length);
        console.log('💰 BACKEND - PAID transactions details:', paidTransactions.map(t => ({
            _id: t._id,
            orderCode: t.orderCode,
            status: t.status,
            accountId: t.accountId,
            createdAt: t.createdAt,
            finalAmount: t.finalAmount
        })));
        const cancelledTransactions = transactions.filter(t => t.status === 'CANCELLED');
        console.log('🚫 BACKEND - CANCELLED transactions count:', cancelledTransactions.length);
        // SỬA: Thêm debug info vào response để frontend có thể kiểm tra
        const debugInfo = {
            totalTransactions: transactions.length,
            statusCount,
            paidCount: paidTransactions.length,
            cancelledCount: cancelledTransactions.length
        };
        res.status(200).json({
            success: true,
            data: transactions,
            debug: debugInfo // Thêm debug info để frontend kiểm tra
        });
    }
    catch (error) {
        console.error('❌ Error in getAllTransactions:', error);
        next(error);
    }
};
exports.getAllTransactions = getAllTransactions;
