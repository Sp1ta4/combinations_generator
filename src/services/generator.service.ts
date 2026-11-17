import type { Pool } from "mysql2/promise";
import GeneratorRepository from "../repositories/generator.repository.js";

class GeneratorService {
	private repository: GeneratorRepository;
	private pool: Pool;
	
	constructor(pool: Pool, repository: GeneratorRepository) {
		this.repository = repository;
		this.pool = pool
	}
}

export default GeneratorService;