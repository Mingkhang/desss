import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
// THAY ĐỔI Ở ĐÂY: Đổi tên hàm import
import { getAllTransactions } from '../../controllers/admin/transaction.admin.controller';

const router = Router();

router.use(protect);

// THAY ĐỔI Ở ĐÂY: Đổi tên hàm được gọi
router.get('/', getAllTransactions);

export default router;