import { Event } from "./event";
import { Entity } from "./services";
import { State } from "./state";

type EffectOptions = {
	isAutoAbort?: boolean;
};

type EffectFunction<Params, Result> = (
	params: Params,
	abortController: AbortController
) => Promise<Result>;

type NotifyPayload<Params, Result, Error> =
	| {
			state: "fulfilled";
			params: Params;
			result: Result;
	  }
	| { state: "rejected"; params: Params; error: Error };

class Effect<Params = void, Result = void, Error = any> extends Entity<
	NotifyPayload<Params, Result, Error>
> {
	private abortController: AbortController | null = null;

	fulfilled = new Event<{ params: Params; result: Result }>();
	rejected = new Event<{ params: Params; error: Error }>();

	pendingChanged = new Event<boolean>();
	isPending = new State<boolean>(false).changeOn(this.pendingChanged);

	constructor(
		private effectFunction: EffectFunction<Params, Result>,
		private options: EffectOptions = {}
	) {
		super();
	}

	implement(effectFunction: EffectFunction<Params, Result>): void {
		this.effectFunction = effectFunction;
	}

	private abortIfNeeded(): void {
		if (this.abortController) {
			if (!this.abortController.signal.aborted) {
				this.abortController.abort();
			}
		}
	}

	async run(params: Params): Promise<void> {
		try {
			this.pendingChanged.dispatch(true);

			if (this.options.isAutoAbort) {
				this.abortIfNeeded();
			}

			this.abortController = new AbortController();

			const result = await this.effectFunction(params, this.abortController);
			this.abortController = null;

			this.pendingChanged.dispatch(false);
			this.notify({ state: "fulfilled", params, result });
			this.fulfilled.dispatch({ params, result });
		} catch (e) {
			const error = (e ?? {}) as any;
			if (error.name === "AbortError") return;

			this.pendingChanged.dispatch(false);
			this.notify({ state: "rejected", params, error });
			this.rejected.dispatch({ params, error });
		}
	}

	abort(): void {
		this.abortIfNeeded();
		this.pendingChanged.dispatch(false);
		this.abortController = null;
	}

	release(): void {
		this.abort();
		this.isPending.release();
		this.pendingChanged.release();
		this.fulfilled.release();
		this.rejected.release();
		super.release();
	}
}

export { Effect, EffectFunction };
