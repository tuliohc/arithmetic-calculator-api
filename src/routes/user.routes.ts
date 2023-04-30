
import express from 'express';
import userController from '../controllers/user.controller';

const router = express.Router();

router.post('/signin', userController.signin);
router.post('/logout', userController.logout);

export default router;