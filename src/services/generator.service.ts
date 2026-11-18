import { createHash } from 'node:crypto';
import type { Pool, PoolConnection } from 'mysql2/promise';
import type GeneratorRepository from '../repositories/generator.repository.js';
import type IGenerationResult from '../entities/IGenerationResult.js';
import type CombinationItemRow from '../entities/CombinationItemRow.js';
import { ALPHABET, BATCH_SIZE } from '../constants/constants.js';

function isDuplicateEntryError(error: unknown): boolean {
	return error instanceof Error && 'code' in error && error.code === 'ER_DUP_ENTRY';
}

class GeneratorService {
	private repository: GeneratorRepository;
	private pool: Pool;

	constructor(pool: Pool, repository: GeneratorRepository) {
		this.repository = repository;
		this.pool = pool;
	}

	generate = async (items: number[], length: number): Promise<IGenerationResult> => {
		const hash = createHash('sha256')
			.update(`${items.join(',')}_${length}`)
			.digest();

		const existed = await this.getExisted(hash);
		if (existed) {
			return existed;
		}

		try {
			return await this.createNew(items, length, hash);
		} catch (error) {
			if (!isDuplicateEntryError(error)) {
				throw error;
			}

			const saved = await this.getExisted(hash);
			if (!saved) {
				throw error;
			}

			return saved;
		}
	};

	private async getExisted(hash: Buffer): Promise<IGenerationResult | undefined> {
		const existed = await this.repository.getExistedCombination(hash);
		if (existed) {
			await this.repository.createResult(existed.id, existed.combination, { connection: undefined });
		}

		return existed;
	}

	private async createNew(items: number[], length: number, hash: Buffer): Promise<IGenerationResult> {
		const combinations = this.generateCombinations(items, length);
		const connection = await this.pool.getConnection();
		try {
			await connection.beginTransaction();
			const itemIds = await this.createItems(items, { connection });
			const combinationId = await this.createCombination(hash, { connection });
			await this.createCombinationItems(combinations, combinationId, itemIds, { connection });
			await this.repository.createResult(combinationId, combinations, { connection });
			await connection.commit();

			return { id: combinationId, combination: combinations };
		} catch (error) {
			await connection.rollback();
			throw error;
		} finally {
			connection.release();
		}
	}

	private generateCombinations(items: number[], length: number): string[][] {
		const result: string[][] = [];

		function build(groupIndex: number, currentCombination: string[]): void {
			if (currentCombination.length === length) {
				result.push([...currentCombination]);
				return;
			}

			const needed = length - currentCombination.length;
			for (let i = groupIndex; needed <= items.length - i; i++) {
				for (let j = 1; j <= items[i]; j++) {
					currentCombination.push(ALPHABET[i] + j);
					build(i + 1, currentCombination);
					currentCombination.pop();
				}
			}
		}

		build(0, []);
		return result;
	}

	private async createItems(
		items: number[],
		{ connection }: { connection: PoolConnection }
	): Promise<Map<string, number>> {
		const uniqueItems: string[] = [];

		items.forEach((item, index) => {
			for (let i = 1; i <= item; i++) {
				uniqueItems.push(ALPHABET[index] + i);
			}
		});

		const result = await this.repository.createItemsIfNotExist(uniqueItems, { connection });

		const itemsMap = new Map<string, number>();

		result.forEach(({ id, item }) => {
			itemsMap.set(item, id);
		});

		return itemsMap;
	}

	private async createCombination(
		hash: Buffer,
		{ connection }: { connection: PoolConnection }
	): Promise<number> {
		const id = await this.repository.createCombination(hash, { connection });
		return id;
	}

	private async createCombinationItems(
		combinations: string[][],
		combinationId: number,
		itemIds: Map<string, number>,
		{ connection }: { connection: PoolConnection }
	): Promise<void> {
		let batch: CombinationItemRow[] = [];

		for (const [groupIndex, combination] of combinations.entries()) {
			for (const [position, item] of combination.entries()) {
				batch.push([combinationId, groupIndex, position, itemIds.get(item)!]);
			}

			if (batch.length >= BATCH_SIZE) {
				await this.repository.createCombinationItems(batch, { connection });
				batch = [];
			}
		}

		if (batch.length > 0) {
			await this.repository.createCombinationItems(batch, { connection });
		}
	}
}

export default GeneratorService;
