import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { getAllVouchers, createVoucherByAdmin, deleteVoucherByAdmin } from '../../controllers/admin/voucher.admin.controller';

const router = Router();

router.use(protect);

router.route('/')
    .get(getAllVouchers)
    .post(createVoucherByAdmin);

router.route('/:id')
    .delete(deleteVoucherByAdmin);

export default router;