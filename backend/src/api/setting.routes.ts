import { Router } from 'express';
import { getPublicSettings } from '../controllers/public/setting.controller';

const router = Router();

// Route này sẽ gọi hàm getPublicSettings đã được import
router.get('/', getPublicSettings);

export default router;