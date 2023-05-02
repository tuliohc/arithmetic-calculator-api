
import { Router } from 'express';
import seedController from '../controllers/seed.controller';

const router = Router();

// used to inject pre-defined objects from src/seed/*
router.post('/', seedController.seed);

export default router;