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
	Params = void,
	Result = void,
	ErrorType extends Error = Error
> extends Entity<Params> {
	onStart = new Event<Params>();
	onResolve = new Event<{ params: Params; result: Result }>();
	onReject = new Event<{ params: Params; error: ErrorType }>();
	onFinish = new Event<Params>();
	onAbort = new Event<{ params: Params; error: Error }>();

	statusState = new State<EffectStatus>(EffectStatus.idle);
	isPendingState = new ComputeState(
		this.statusState,
		(status) => status === EffectStatus.pending
	);

	private abortController = new AbortController();

	constructor(private effectFunction: EffectFunction<Params, Result>) {
		super();
	}

	implement(effectFunction: EffectFunction<Params, Result>): void {
		this.effectFunction = effectFunction;
	}

	async run(params: Params): Promise<void> {
		try {
			if (this.isPendingState.get()) {
				return this.abort();
			}

			this.onStart.dispatch(params);
			this.statusState.set(EffectStatus.pending);

			const result = await this.effectFunction(params, this.abortController);

			this.statusState.set(EffectStatus.resolved);
			this.onResolve.dispatch({ params, result });
		} catch (e) {
			const error = e as ErrorType;

			if (error.name === "AbortError") {
				this.onAbort.dispatch({ params, error });
			} else {
				this.statusState.set(EffectStatus.rejected);
				this.onReject.dispatch({ params, error });
			}

			throw error;
		} finally {
			this.onFinish.dispatch(params);
		}
	}

	abort(): void {
		this.abortController.abort();
		this.abortController = new AbortController();
	}
}

export { Effect, EffectFunction, EffectStatus };
