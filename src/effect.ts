import { ComputeState } from "./compute-state";
import { Event } from "./event";
import { Entity } from "./shared/entity";
import { State } from "./state";

enum EffectStatus {
	idle = "idle",
	pending = "pending",
	resolved = "resolved",
	rejected = "rejected",
}

type EffectFunction<TParams, TResult> = (
	params: TParams,
	abortController: AbortController
) => Promise<TResult>;

class Effect<
	TParams extends any = void,
	TResult extends any = void,
	TError extends Error = Error
> extends Entity<TParams> {
	started = new Event<TParams>();
	resolved = new Event<{ params: TParams; result: TResult }>();
	rejected = new Event<{ params: TParams; error: TError }>();
	finished = new Event<TParams>();
	aborted = new Event<{ params: TParams; error: Error }>();

	statusState = new State<EffectStatus>(EffectStatus.idle);
	runningCountState = new State(0);
	pendingState = new ComputeState(
		[this.statusState],
		(status) => status === EffectStatus.pending
	);
	effectFunctionState: State<EffectFunction<TParams, TResult>>;

	constructor(effectFunction: EffectFunction<TParams, TResult>) {
		super();
		this.effectFunctionState = new State(effectFunction);

		this.started.listen(() => {
			this.runningCountState.change((count) => count + 1);
			this.statusState.set(EffectStatus.pending);
		});

		this.resolved.listen(() => {
			this.statusState.set(EffectStatus.resolved);
		});

		this.rejected.listen(() => {
			this.statusState.set(EffectStatus.rejected);
		});

		this.finished.listen(() => {
			this.runningCountState.change((count) => count - 1);
		});
	}

	implement = (effectFunction: EffectFunction<TParams, TResult>): void => {
		this.effectFunctionState.set(effectFunction);
	};

	async run(
		params: TParams,
		abortController: AbortController = new AbortController()
	): Promise<TResult> {
		try {
			this.started.dispatch(params);
			const result = await this.effectFunctionState.get()(
				params,
				abortController
			);
			this.resolved.dispatch({ params, result });

			return result;
		} catch (e) {
			const error = e as TError;

			this[error.name === "AbortError" ? "aborted" : "rejected"].dispatch({
				params,
				error,
			});

			throw error;
		} finally {
			this.finished.dispatch(params);
		}
	}
}

export { Effect, EffectFunction, EffectStatus };
