import { z } from 'zod';

const MAX_TYPES = 26;
const MAX_ITEMS_PER_TYPE = 100;

export const generateSchema = z
	.object({
		items: z
			.array(z.number().int().positive().max(MAX_ITEMS_PER_TYPE))
			.min(1)
			.max(MAX_TYPES),
		length: z.number().int().positive(),
	})
	.refine((data) => data.length <= data.items.length, {
		message: 'length must not exceed the number of item types',
		path: ['length'],
	});

export type GenerateDto = z.infer<typeof generateSchema>;