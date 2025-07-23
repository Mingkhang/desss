import { Router } from 'express';
import authAdminRoutes from './auth.routes';
import accountAdminRoutes from './account.admin.routes';
import settingAdminRoutes from './setting.admin.routes';
import voucherAdminRoutes from './voucher.admin.routes';
import transactionAdminRoutes from './transaction.admin.routes';
import statisticsAdminRoutes from './statistics.admin.routes';

const router = Router();

import agentsAdminRoutes from './agents.admin.routes';
router.use('/auth', authAdminRoutes);
router.use('/accounts', accountAdminRoutes);
router.use('/settings', settingAdminRoutes);
router.use('/vouchers', voucherAdminRoutes);
router.use('/transactions', transactionAdminRoutes);
router.use('/statistics', statisticsAdminRoutes);
router.use('/agents', agentsAdminRoutes);

export default router;