type Callback<Args extends unknown[]> = (...args: Args) => void;

const createBatchFunction = <Args extends unknown[]>(
	callback: Callback<Args>
): Callback<Args> => {
	let isPending = false;

	return (...args) => {
		if (!isPending) {
			isPending = true;

			queueMicrotask(() => {
				callback(...args);
				isPending = false;
			});
		}
	};
};

export { createBatchFunction };
