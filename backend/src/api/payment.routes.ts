// File: src/api/payment.routes.ts
import { Router } from 'express';
import { createPaymentLinkController, getOrderConfirmationDetails, cancelOrderByClient } from '../controllers/public/payment.controller';
import { orderRateLimitMiddleware } from '../middlewares/orderRateLimit.middleware';

const router = Router();

// SỬA ĐỔI: Xóa middleware 'createPaymentLimiter' khỏi route này
router.post('/create-payment-link', orderRateLimitMiddleware, createPaymentLinkController);


// Các route khác không bị ảnh hưởng
router.get('/order-confirmation-details/:orderCode', getOrderConfirmationDetails);
router.post('/cancel-order', cancelOrderByClient);

export default router;