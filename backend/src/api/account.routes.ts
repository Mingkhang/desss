import { Router } from 'express';
import { getPublicAccounts } from '../controllers/public/account.controller';

const router = Router();

router.get('/', getPublicAccounts);

export default router;