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

type EffectFunction<Params, Result> = (
	params: Params,
	abortController: AbortController
) => Promise<Result>;

class Effect<
	Params extends any = void,
	Result extends any = void,
	ErrorType extends Error = Error
> extends Entity<Params> {
	started = new Event<Params>();
	resolved = new Event<{ params: Params; result: Result }>();
	rejected = new Event<{ params: Params; error: ErrorType }>();
	finished = new Event<Params>();
	aborted = new Event<{ params: Params; error: Error }>();

	statusState = new State<EffectStatus>(EffectStatus.idle);
	runningCountState = new State(0);
	pendingState = new ComputeState(
		this.statusState,
		(status) => status === EffectStatus.pending
	);
	effectFunctionState: State<EffectFunction<Params, Result>>;

	constructor(effectFunction: EffectFunction<Params, Result>) {
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

	implement = (effectFunction: EffectFunction<Params, Result>): void => {
		this.effectFunctionState.set(effectFunction);
	};

	async run(
		params: Params,
		abortController: AbortController = new AbortController()
	): Promise<Result> {
		try {
			this.started.dispatch(params);
			const result = await this.effectFunctionState.get()(
				params,
				abortController
			);
			this.resolved.dispatch({ params, result });

			return result;
		} catch (e) {
			const error = e as ErrorType;

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
