import type { PoolConnection } from "mysql2/promise";

class GeneratorRepository {
	async ping(connection: PoolConnection): Promise<void> {
		await connection.ping();
	}
}

export default GeneratorRepository;
