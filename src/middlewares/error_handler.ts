import type { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export function errorHandler(
	err: Error & { status?: number },
	_req: Request,
	res: Response,
	_next: NextFunction
): void {
	const status = err.status ?? StatusCodes.INTERNAL_SERVER_ERROR;

	if (status >= StatusCodes.INTERNAL_SERVER_ERROR) {
		console.error(err);
		res.status(status).json({
			error: 'Internal server error',
		});
		return;
	}

	res.status(status).json({
		error: err.message,
	});
}
