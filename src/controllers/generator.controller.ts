import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type GeneratorService from '../services/generator.service.js';
import type { GenerateDto } from '../dto/generate.dto.js';

class GeneratorController {
	private service: GeneratorService;

	constructor(service: GeneratorService) {
		this.service = service;
	}

	generate = async (req: Request, res: Response): Promise<void> => {
		const { items, length } = req.body as GenerateDto;

		const result = await this.service.generate(items, length);
		res.status(StatusCodes.CREATED).json(result);
	};
}

export default GeneratorController;
