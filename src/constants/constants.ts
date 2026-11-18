const ALPHABET: string[] = [
	'A', 'B', 'C', 'D', 'E', 'F', 'G',
	'H', 'I', 'J', 'K', 'L', 'M', 'N',
	'O', 'P', 'Q', 'R', 'S', 'T', 'U',
	'V', 'W', 'X', 'Y', 'Z',
];

const BATCH_SIZE: number = 5000;

const MAX_DEADLOCK_RETRIES: number = 3;

export { ALPHABET, BATCH_SIZE, MAX_DEADLOCK_RETRIES };
