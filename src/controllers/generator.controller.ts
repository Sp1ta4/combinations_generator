import type { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes'; 
import GeneratorService from "../services/generator.service.js";
import { length, z } from 'zod';
import { GenerateDto } from '../dto/generate.dto.js';

class GeneratorController {
	private service: GeneratorService;

	constructor(service: GeneratorService) {
		this.service = service;
	}

	generate = async (req: Request, res: Response): Promise<void> => {
		const { items, length } = req.body as GenerateDto;
		
		const result = await this.service.generate(items, length);
		res.status(201).json("result");
	};
}

export default GeneratorController;