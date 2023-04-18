type BaseArgs = any[];

type Callback<Args extends BaseArgs> = (...args: Args) => void;

const createBatchFunction = <Args extends BaseArgs>(
	callback: Callback<Args>
): Callback<Args> => {
	let callsCount = 0;

	return (...args) => {
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
