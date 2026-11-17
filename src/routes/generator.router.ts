import { Router } from 'express';
import { container } from '../container.js';


const router = Router();


router.post('/generate', container.generatorController.generate);

export default router;