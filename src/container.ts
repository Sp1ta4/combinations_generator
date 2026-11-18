import GeneratorRepository from './repositories/generator.repository.js';
import GeneratorService from './services/generator.service.js';
import GeneratorController from './controllers/generator.controller.js';
import { pool } from './db/pool.js';

const generatorRepository = new GeneratorRepository(pool);
const generatorService = new GeneratorService(pool, generatorRepository);
const generatorController = new GeneratorController(generatorService);

export const container = {
	generatorRepository,
	generatorService,
	generatorController,
};