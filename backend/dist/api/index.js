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
const agentOrderController = __importStar(require("../controllers/agent/agentOrder.controller"));
const agentAuthController = __importStar(require("../controllers/agent/agentAuth.controller"));
const express_1 = require("express");
const ping_routes_1 = __importDefault(require("./ping.routes"));
const account_routes_1 = __importDefault(require("./account.routes"));
const payment_routes_1 = __importDefault(require("./payment.routes"));
const voucher_routes_1 = __importDefault(require("./voucher.routes"));
const setting_routes_1 = __importDefault(require("./setting.routes"));
const admin_1 = __importDefault(require("./admin"));
const test_routes_1 = __importDefault(require("./test.routes"));
const router = (0, express_1.Router)();
// Agent API
router.post('/agent/login', agentAuthController.agentLoginAndOrder);
router.post('/agent/orders', agentOrderController.createAgentOrder);
router.get('/agent/orders', agentOrderController.getAgentOrders);
router.get('/agent/orders/:orderId', agentOrderController.getAgentOrderDetail);
// Route lấy số dư đại lý
router.get('/agent/balance', async (req, res) => {
    const agentId = req.query.agentId;
    if (!agentId)
        return res.status(400).json({ success: false, message: 'Thiếu agentId' });
    const Agent = require('../models/agent.model').default;
    const agent = await Agent.findById(agentId);
    if (!agent)
        return res.status(404).json({ success: false, message: 'Không tìm thấy đại lý' });
    res.json({ success: true, balance: agent.balance });
});
// Public Routes
router.use("/ping", ping_routes_1.default);
router.use("/accounts", account_routes_1.default);
router.use("/payment", payment_routes_1.default);
router.use("/vouchers", voucher_routes_1.default);
router.use("/settings", setting_routes_1.default);
router.use("/test", test_routes_1.default); // Thêm route test
// Admin Routes
router.use("/admin", admin_1.default);
exports.default = router;
