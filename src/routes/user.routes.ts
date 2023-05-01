
import { Router } from 'express';
import userController from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/signin', userController.signin);
router.post('/logout', userController.logout);
router.get('/:id/balance', requireAuth, userController.getUserBalance);

export default router;