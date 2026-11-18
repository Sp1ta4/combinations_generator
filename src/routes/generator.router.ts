import { Router } from 'express';
import { container } from '../container.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { generateSchema } from '../dto/generate.dto.js';

const router = Router();

router.post('/', validateBody(generateSchema), container.generatorController.generate);

export default router;