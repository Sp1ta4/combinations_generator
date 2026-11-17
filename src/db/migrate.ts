import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { RowDataPacket } from 'mysql2/promise';
import { pool } from './pool.js';

const MIGRATIONS_DIR = path.join(import.meta.dirname, 'migrations');

async function ensureMigrationsTable(): Promise<void> {
	await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      name       VARCHAR(255) NOT NULL,
      applied_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

async function getApplied(): Promise<Set<string>> {
	const [rows] = await pool.query<RowDataPacket[]>('SELECT name FROM migrations');
	return new Set(rows.map((row) => row.name as string));
}

async function run(): Promise<void> {
	await ensureMigrationsTable();
	const applied = await getApplied();

	const files = (await readdir(MIGRATIONS_DIR))
		.filter((file) => file.endsWith('.sql'))
		.sort();

	for (const file of files) {
		if (applied.has(file)) continue;

		const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
		await pool.query(sql);
		await pool.query('INSERT INTO migrations (name) VALUES (?)', [file]);
		console.log(`applied: ${file}`);
	}
}

run()
	.then(() => console.log('migrations done'))
	.catch((err) => {
		console.error(err);
		process.exitCode = 1;
	})
	.finally(() => pool.end());