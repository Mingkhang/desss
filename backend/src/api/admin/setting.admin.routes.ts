import { Router } from 'express';
import { updateSettings } from '../../controllers/admin/setting.admin.controller';
import { protect } from '../../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.put('/', updateSettings);

export default router;