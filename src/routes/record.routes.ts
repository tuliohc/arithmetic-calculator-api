import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { recordController } from '../controllers/record.controller';

const router = Router();

router.post('/', requireAuth, recordController.getRecords);

export default router;