import type IGenerationResult from './IGenerationResult.js';

export default interface IGenerationOutcome {
	result: IGenerationResult;
	created: boolean;
}
