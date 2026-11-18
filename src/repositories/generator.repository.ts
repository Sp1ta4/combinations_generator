import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import type IGenerationResult from '../entities/IGenerationResult.js';
import type IItem from '../entities/IItem.js';
import { pool } from '../db/pool.js';
import type CombinationItemRow from '../entities/CombinationItemRow.js';

class GeneratorRepository {
	async getExistedCombination(hash: Buffer): Promise<IGenerationResult | undefined> {
		const [res] = await pool.execute<(IGenerationResult & RowDataPacket)[]>(`
			SELECT
				r.combination_id AS id,
				r.response AS combination
			FROM responses AS r
			JOIN combinations AS c ON r.combination_id = c.id
			WHERE c.combination_hash = ?
			LIMIT 1;
		`, [hash]);

		return res[0];
	}

	async createResult(
		combinationId: number,
		combination: string[][],
		{ connection }: { connection: PoolConnection | undefined }
	): Promise<void> {
		const executor = connection ?? pool;

		await executor.execute(`
			INSERT INTO responses (combination_id, response) VALUES (?, ?);
		`, [combinationId, JSON.stringify(combination)]);
	}

	async createItemsIfNotExist(
		items: string[],
		{ connection }: { connection: PoolConnection | undefined }
	): Promise<IItem[]> {
		const insertPlaceholders = items.map(() => '(?)').join(', ');
		const selectPlaceholders = items.map(() => '?').join(', ');
		const executor = connection ?? pool;

		await executor.execute(`
			INSERT IGNORE INTO items (item)
			VALUES ${insertPlaceholders};
		`, items);

		const [res] = await executor.execute<(IItem & RowDataPacket)[]>(`
			SELECT id, item
			FROM items
			WHERE item IN (${selectPlaceholders});
		`, items);

		return res;
	}

	async createCombination(
		hash: Buffer,
		{ connection }: { connection: PoolConnection | undefined }
	): Promise<number> {
		const executor = connection ?? pool;

		const [res] = await executor.execute<ResultSetHeader>(`
			INSERT INTO combinations (combination_hash) VALUES (?);
		`, [hash]);

		return res.insertId;
	}

	async createCombinationItems(
		batch: CombinationItemRow[],
		{ connection }: { connection: PoolConnection }
	): Promise<void> {
		await connection.query(`
			INSERT INTO combination_items (combination_id, group_index, position, item_id) VALUES ?;
		`, [batch]);
	}
}

export default GeneratorRepository;
