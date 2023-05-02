import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { recordController } from '../controllers/record.controller';

const router = Router();

router.get('/', requireAuth, recordController.getRecords);
router.delete('/:id', requireAuth, recordController.deleteRecord);

export default router;