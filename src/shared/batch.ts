type BaseArgs = any[];

type Callback<Args extends BaseArgs> = (...args: Args) => void;

const createBatchFunction = <Args extends BaseArgs>(
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
