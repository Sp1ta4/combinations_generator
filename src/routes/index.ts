import { Router } from 'express';
import generatorRouter from './generator.router.js'

const router = Router();

router.use('/generator', generatorRouter);

export default router;