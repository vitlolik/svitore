import { Entity } from "./shared";
import { State } from "./state";

type EffectOptions = {
	isAutoAbort?: boolean;
};

type EffectFunction<Params, Result> = (
	params: Params,
	abortController: AbortController
) => Promise<Result>;

type NotifyPayload<Params, Result, ErrorType> =
	| {
			state: "fulfilled";
			params: Params;
			result: Result;
	  }
	| { state: "rejected"; params: Params; error: ErrorType };

class Effect<Params = void, Result = void, ErrorType = any> extends Entity<
	NotifyPayload<Params, Result, ErrorType>
> {
	private abortController: AbortController | null = null;

	isPending = new State(false);

	constructor(
		private effectFunction: EffectFunction<Params, Result>,
		private options: EffectOptions = {}
	) {
		super();
	}

	clone(options = this.options): Effect<Params, Result, ErrorType> {
		return new Effect(this.effectFunction, options);
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
			this.isPending.set(true);

			if (this.options.isAutoAbort) {
				this.abortIfNeeded();
			}

			this.abortController = new AbortController();

			const result = await this.effectFunction(params, this.abortController);
			this.abortController = null;

			this.isPending.set(false);
			this.notify({ state: "fulfilled", params, result });
		} catch (e) {
			const error = (e ?? {}) as any;
			if (error.name === "AbortError") return;

			this.isPending.set(false);
			this.notify({ state: "rejected", params, error });
		}
	}

	abort(): void {
		this.abortIfNeeded();
		this.isPending.set(false);
		this.abortController = null;
	}

	release(): void {
		this.abort();
		this.isPending.release();
		super.release();
	}
}

export { Effect, EffectFunction };
