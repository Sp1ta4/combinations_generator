import { z } from 'zod';

const MAX_TYPES = 26;
const MAX_ITEMS_PER_TYPE = 100;
const MAX_COMBINATIONS = 100000;

function countCombinations(items: number[], length: number): number {
	const counts: number[] = new Array(length + 1).fill(0);
	counts[0] = 1;

	for (const item of items) {
		for (let k = length; k >= 1; k--) {
			counts[k] += counts[k - 1] * item;
		}
	}

	return counts[length];
}

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
	})
	.refine((data) => countCombinations(data.items, data.length) <= MAX_COMBINATIONS, {
		message: `number of combinations must not exceed ${MAX_COMBINATIONS}`,
		path: ['length'],
	});

export type GenerateDto = z.infer<typeof generateSchema>;
