"use strict";
// Controller xử lý đơn hàng cho đại lý
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgentOrderDetail = exports.getAgentOrders = exports.createAgentOrder = void 0;
const agentTransaction_model_1 = __importDefault(require("../../models/agentTransaction.model"));
const account_model_1 = __importDefault(require("../../models/account.model"));
const agent_model_1 = __importDefault(require("../../models/agent.model"));
const orderId_1 = require("../../utils/orderId");
// Tạo đơn hàng thuê tài khoản cho đại lý
const createAgentOrder = async (req, res) => {
    try {
        const { agentName, rentalPackageKey } = req.body;
        // Tìm đúng đại lý theo tên
        const agent = await agent_model_1.default.findOne({ name: agentName });
        if (!agent)
            return res.status(404).json({ success: false, message: 'Không tìm thấy đại lý' });
        // Lấy giá gói thuê từ Setting
        const Setting = require('../../models/setting.model').default;
        const settingDoc = await Setting.findOne();
        if (!settingDoc || !settingDoc.rentalPrices || !settingDoc.rentalPrices.has(rentalPackageKey)) {
            return res.status(400).json({ success: false, message: 'Không tìm thấy giá gói thuê' });
        }
        const price = settingDoc.rentalPrices.get(rentalPackageKey).price;
        // Tạo mã đơn hàng trạng thái CREATED
        const orderId = (0, orderId_1.generateOrderId)(agent._id.toString());
        let transactionStatus = 'CREATED';
        // Kiểm tra số dư
        if (agent.balance < price) {
            await agentTransaction_model_1.default.create({
                agentId: agent._id,
                orderId,
                price,
                status: 'FAILED',
                createdAt: new Date(),
            });
            return res.status(400).json({ success: false, message: 'Số dư không đủ', orderId });
        }
        // Tìm tài khoản available
        const account = await account_model_1.default.findOne({ status: 'available' });
        if (!account) {
            await agentTransaction_model_1.default.create({
                agentId: agent._id,
                orderId,
                price,
                status: 'FAILED',
                createdAt: new Date(),
            });
            return res.status(404).json({ success: false, message: 'Không còn tài khoản trống', orderId });
        }
        // Tạo giao dịch thành công
        transactionStatus = 'PAID';
        const expiredAt = new Date(Date.now() + settingDoc.rentalPrices.get(rentalPackageKey).duration * 60 * 60 * 1000);
        const transaction = await agentTransaction_model_1.default.create({
            agentId: agent._id,
            orderId,
            accountId: account._id,
            price,
            status: transactionStatus,
            createdAt: new Date(),
            expiredAt,
            username: account.username,
            password: account.password,
            balanceAfter: agent.balance - price,
        });
        // Trừ số dư
        agent.balance -= price;
        await agent.save();
        // Đánh dấu tài khoản đã thuê
        account.status = 'rented';
        account.rentedAt = new Date();
        account.expiresAt = expiredAt;
        account.currentTransactionId = transaction._id;
        await account.save();
        // Emit socket event for rented status
        if (req.io) {
            req.io.emit('account_updated', { accountId: account._id, newStatus: 'rented', expiresAt: account.expiresAt });
        }
        // Hẹn giờ đổi trạng thái về 'waiting' sau khi đã thuê thành công
        const rentalDurationMs = expiredAt.getTime() - Date.now();
        setTimeout(async () => {
            try {
                const accountToExpire = await account_model_1.default.findById(account._id);
                if (accountToExpire && accountToExpire.status === 'rented') {
                    accountToExpire.status = 'waiting';
                    await accountToExpire.save();
                    // Emit socket event for waiting status
                    if (req.io) {
                        req.io.emit('account_updated', { accountId: accountToExpire._id, newStatus: 'waiting' });
                    }
                }
            }
            catch (err) {
                console.error('Error in setTimeout for account expiration:', err);
            }
        }, rentalDurationMs);
        // Trả về thông tin đơn hàng
        res.json({
            success: true,
            orderId,
            username: account.username,
            password: account.password,
            expiredAt,
            price,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi hệ thống', error });
    }
};
exports.createAgentOrder = createAgentOrder;
// Lấy danh sách đơn hàng của đại lý
const getAgentOrders = async (req, res) => {
    try {
        const agentId = req.query.agentId;
        if (!agentId)
            return res.status(400).json({ success: false, message: 'Thiếu agentId' });
        const AgentTransaction = require('../../models/agentTransaction.model').default;
        const orders = await AgentTransaction.find({ agentId }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi hệ thống', error });
    }
};
exports.getAgentOrders = getAgentOrders;
// Lấy chi tiết đơn hàng
const getAgentOrderDetail = async (req, res) => {
    try {
        const agentId = req.body.agentId || req.query.agentId;
        const { orderId } = req.params;
        const order = await agentTransaction_model_1.default.findOne({ agentId, orderId });
        if (!order)
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        res.json({ success: true, order });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi hệ thống', error });
    }
};
exports.getAgentOrderDetail = getAgentOrderDetail;
