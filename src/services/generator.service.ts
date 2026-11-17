import type { Pool } from "mysql2/promise";
import GeneratorRepository from "../repositories/generator.repository.js";
import IGenerationResult from "../entities/IGenerationResult.js";

class GeneratorService {
	private repository: GeneratorRepository;
	private pool: Pool;
	
	constructor(pool: Pool, repository: GeneratorRepository) {
		this.repository = repository;
		this.pool = pool
	}

	generate = async (items: number[], length: number): Promise<IGenerationResult>=> {
		const conn = await this.pool.getConnection();
		try {
			await conn.beginTransaction();

			const combinations = this.generateCombinations(items, length);
			let result: IGenerationResult = { id: 1, combination: [["A1", "B1"], ["A1", "B2"]] };

			await conn.commit();
			return result;
		} catch (error) {
			await conn.rollback();
			throw error;
		} finally {
			conn.release();
		}

	}

	private generateCombinations(items: number[], length: number): string[][] {

		return [["A1", "B1"], ["A1", "B2"]];
	}
}

export default GeneratorService;