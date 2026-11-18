import { Router } from 'express';
import generatorRouter from './generator.router.js';

const router = Router();

router.use('/generate', generatorRouter);

export default router;