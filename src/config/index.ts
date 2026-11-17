import { z } from 'zod';

const envSchema = z.object({
	PORT: z.coerce.number().int().positive().default(3000),
	DB_HOST: z.string().default('localhost'),
	DB_PORT: z.coerce.number().int().positive().default(3306),
	DB_USER: z.string(),
	DB_PASSWORD: z.string(),
	DB_NAME: z.string(),
});

const env = envSchema.parse(process.env);

export const config = {
	port: env.PORT,
	db: {
		host: env.DB_HOST,
		port: env.DB_PORT,
		user: env.DB_USER,
		password: env.DB_PASSWORD,
		database: env.DB_NAME,
	},
} as const;