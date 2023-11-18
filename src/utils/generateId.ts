function* idGenerator(): Generator<number, number> {
	let id = 0;

	while (true) {
		yield ++id;
	}
}

const generateId = idGenerator();

export { generateId };
