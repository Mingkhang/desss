import { Router } from 'express';
import { applyVoucher } from '../controllers/public/voucher.controller';

const router = Router();

router.post('/apply', applyVoucher);

export default router;