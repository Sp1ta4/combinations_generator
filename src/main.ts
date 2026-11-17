import app from './app.js';
import { config } from './config/index.js';
import { pool } from './db/pool.js';

async function checkConnections(): Promise<void> {
	const connection = await pool.getConnection();
	try {
		await connection.ping();
	} finally {
		connection.release();
	}
}

async function bootstrap(): Promise<void> {
	await checkConnections();

	app.listen(config.port, () => {
		console.log(`Server is running on port ${config.port}`);
	});
}

bootstrap().catch((err: unknown) => {
	console.error('Fatal error during startup:', err);
	process.exit(1);
});