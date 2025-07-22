"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentLoginAndOrder = void 0;
const agent_model_1 = __importDefault(require("../../models/agent.model"));
// Đăng nhập đại lý
const agentLoginAndOrder = async (req, res) => {
    try {
        const { name, password } = req.body;
        // Loại bỏ khoảng trắng và không phân biệt hoa thường cho name
        const agent = await agent_model_1.default.findOne({
            name: { $regex: `^${name.trim()}$`, $options: 'i' }
        });
        if (!agent || agent.password !== password) {
            return res.status(401).json({ success: false, message: 'Sai tên hoặc mật khẩu đại lý' });
        }
        res.json({ success: true, agentId: agent._id, name: agent.name, balance: agent.balance });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi hệ thống', error });
    }
};
exports.agentLoginAndOrder = agentLoginAndOrder;
