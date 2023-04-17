const createBatchFunction = <Args extends any[]>(
	callback: (...args: Args) => void
) => {
	let callsCount = 0;

	return (...args: Args) => {
		callsCount++;

		if (callsCount === 1) {
			queueMicrotask(() => {
				callback(...args);
				callsCount = 0;
			});
		}
	};
};

export { createBatchFunction };
