import { Effect } from "../effect";

const cancelable = <
	TParams extends any = void,
	TResult extends any = void,
	TError extends Error = Error
>(
	targetEffect: Effect<TParams, TResult, TError>
): Effect<TParams, TResult, TError> => {
	const abortControllerList: AbortController[] = [];
	const effect = new Effect<TParams, TResult, TError>(
		targetEffect.$effectFunction.get()
	);
	const runFunction = effect.run.bind(effect);

	effect.run = async (params: TParams) => {
		const abortController = new AbortController();
		abortControllerList.push(abortController);

		if (effect.$runningCount.get() > 0) {
			const needToAbort = abortControllerList.slice(0, -1);
			needToAbort.forEach((controller) => controller.abort());
		}

		try {
			const result = await runFunction(params, abortController);
			abortControllerList.length = 0;

			return result;
		} catch (error) {
			throw error;
		}
	};

	return effect;
};

export { cancelable };
