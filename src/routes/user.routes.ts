
import { Router } from 'express';
import userController from '../controllers/user.controller';

const router = Router();

router.post('/signin', userController.signin);
router.post('/logout', userController.logout);

export default router;