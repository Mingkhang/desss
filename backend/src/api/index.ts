import * as agentOrderController from '../controllers/agent/agentOrder.controller';
import * as agentAuthController from '../controllers/agent/agentAuth.controller';
import { Router } from "express"
import pingRouter from './ping.routes';
import accountRoutes from "./account.routes"
import paymentRoutes from "./payment.routes"
import voucherRoutes from "./voucher.routes"
import settingRoutes from "./setting.routes"
import adminRoutes from "./admin"
import testRoutes from './test.routes';


const router = Router()

// Agent API
router.post('/agent/login', agentAuthController.agentLoginAndOrder);
router.post('/agent/orders', agentOrderController.createAgentOrder);
router.get('/agent/orders', agentOrderController.getAgentOrders);
router.get('/agent/orders/:orderId', agentOrderController.getAgentOrderDetail);
// Route lấy số dư đại lý
router.get('/agent/balance', async (req, res) => {
  const agentId = req.query.agentId;
  if (!agentId) return res.status(400).json({ success: false, message: 'Thiếu agentId' });
  const Agent = require('../models/agent.model').default;
  const agent = await Agent.findById(agentId);
  if (!agent) return res.status(404).json({ success: false, message: 'Không tìm thấy đại lý' });
  res.json({ success: true, balance: agent.balance });
});

// Public Routes
router.use("/ping", pingRouter);
router.use("/accounts", accountRoutes)
router.use("/payment", paymentRoutes)
router.use("/vouchers", voucherRoutes)
router.use("/settings", settingRoutes)
router.use("/test", testRoutes) // Thêm route test

// Admin Routes
router.use("/admin", adminRoutes)

export default router
