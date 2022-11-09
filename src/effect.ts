import { Event } from "./event";
import { Entity } from "./shared/entity";
import { State } from "./state";
import { EffectStatus } from "./types";

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

	$status: State<EffectStatus>;
	$pending: State<boolean>;
	$runningCount: State<number>;
	$effectFunction: State<EffectFunction<TParams, TResult>>;

	private incrementRunningCount = new Event();
	private decrementRunningCount = new Event();

	constructor(effectFunction: EffectFunction<TParams, TResult>) {
		super();
		this.$effectFunction = new State(effectFunction);
		this.$status = new State<EffectStatus>(EffectStatus.idle)
			.on(this.started, () => EffectStatus.pending)
			.on(this.resolved, () => EffectStatus.resolved)
			.on(this.rejected, () => EffectStatus.rejected);

		this.$pending = this.$status.map(
			(status) => status === EffectStatus.pending
		);

		this.$runningCount = new State(0)
			.on(this.incrementRunningCount, (_, state) => state + 1)
			.on(this.decrementRunningCount, (_, state) => state - 1);

		this.started.channel({ target: this.incrementRunningCount });
		this.finished.channel({ target: this.decrementRunningCount });
	}

	implement(effectFunction: EffectFunction<TParams, TResult>): void {
		this.$effectFunction.inform(effectFunction);
	}

	onReset(event: Event): void {
		this.$effectFunction.onReset(event);
		this.$status.onReset(event);
		this.$pending.onReset(event);
		this.$runningCount.onReset(event);
	}

	inform(params: TParams): void {
		this.run(params);
	}

	async run(
		params: TParams,
		abortController: AbortController = new AbortController()
	): Promise<TResult> {
		try {
			this.notify(params);
			this.started.fire(params);
			const result = await this.$effectFunction.get()(params, abortController);
			this.resolved.fire({ params, result });

			return result;
		} catch (e) {
			const error = e as TError;

			this[error.name === "AbortError" ? "aborted" : "rejected"].fire({
				params,
				error,
			});

			throw error;
		} finally {
			this.finished.fire(params);
		}
	}
}

export { Effect, EffectFunction };
