import GeneratorService from "../services/generator.service.js";

class GeneratorController {
	private service: GeneratorService;

	constructor(service: GeneratorService) {
		this.service = service;
	}

	generate = () => {
		console.log("generated");
	}
}

export default GeneratorController;