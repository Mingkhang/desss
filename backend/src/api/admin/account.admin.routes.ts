import { Router } from 'express';
import { createAccount, getAllAccountsAdmin, updateAccount, deleteAccount, toggleAccountStatus } from '../../controllers/admin/account.admin.controller';
import { protect } from '../../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.route('/')
    .get(getAllAccountsAdmin)
    .post(createAccount);

router.route('/:id')
    .put(updateAccount)
    .delete(deleteAccount);

// **ROUTE MỚI CHO CHỨC NĂNG TẠM DỪNG / TIẾP TỤC**
router.put('/:id/status', toggleAccountStatus);

export default router;