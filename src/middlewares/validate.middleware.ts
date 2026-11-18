import type { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { z } from 'zod';

export function validateBody(schema: z.ZodType) {
	return (req: Request, res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req.body);

		if (!result.success) {
			res.status(StatusCodes.BAD_REQUEST).json({
				error: 'Validation failed',
				details: result.error.issues.map((issue) => ({
					path: issue.path.join('.'),
					message: issue.message,
				})),
			});
			return;
		}

		req.body = result.data;
		next();
	};
}