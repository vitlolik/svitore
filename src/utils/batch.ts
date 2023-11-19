type Callback<Args extends any[]> = (...args: Args) => void;

const createBatchFunction = <Args extends any[]>(
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
