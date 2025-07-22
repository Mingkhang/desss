"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// File: src/api/payment.routes.ts
const express_1 = require("express");
const payment_controller_1 = require("../controllers/public/payment.controller");
const orderRateLimit_middleware_1 = require("../middlewares/orderRateLimit.middleware");
const router = (0, express_1.Router)();
// SỬA ĐỔI: Xóa middleware 'createPaymentLimiter' khỏi route này
router.post('/create-payment-link', orderRateLimit_middleware_1.orderRateLimitMiddleware, payment_controller_1.createPaymentLinkController);
// Các route khác không bị ảnh hưởng
router.get('/order-confirmation-details/:orderCode', payment_controller_1.getOrderConfirmationDetails);
router.post('/cancel-order', payment_controller_1.cancelOrderByClient);
exports.default = router;
