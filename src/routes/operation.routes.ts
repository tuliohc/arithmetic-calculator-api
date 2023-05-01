import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { operationController } from '../controllers/operation.controller';

const router = Router();

router.post('/:type', requireAuth, operationController.performOperation);

export default router;