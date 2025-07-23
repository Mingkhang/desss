import { Router } from 'express';
import { getAdminStatistics } from '../../controllers/admin/statistics.admin.controller';

const router = Router();

router.get('/', getAdminStatistics);

export default router;
