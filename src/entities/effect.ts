import { Event } from "./event";
import { Entity } from "./services";
import { State } from "./state";

type EffectOptions = {
	isAutoCancelable?: boolean;
};

type EffectFunction<Params, Result> = (
	params: Params,
	signal: AbortSignal,
) => Promise<Result>;

type NotifyPayload<Params, Result, ErrorType> =
	| {
			state: "fulfilled";
			params: Params;
			result: Result;
	  }
	| {
			state: "rejected";
			params: Params;
			error: ErrorType;
	  };

class Effect<
	Params = void,
	Result = void,
	ErrorType extends Error = Error,
> extends Entity<NotifyPayload<Params, Result, ErrorType>> {
	private abortController: AbortController | null = null;
	private pendingChanged = new Event<boolean>();

	readonly fulfilled = new Event<{ params: Params; result: Result }>();
	readonly rejected = new Event<{ params: Params; error: ErrorType }>();
	readonly pending = new State(false).changeOn(this.pendingChanged);

	constructor(
		public fn: EffectFunction<Params, Result>,
		private options: EffectOptions = {},
	) {
		super();
	}

	private cancelIfNeeded(): void {
		if (this.abortController) {
			if (!this.abortController.signal.aborted) {
				this.abortController.abort();
			}
		}
	}

	async run(params: Params): Promise<void> {
		try {
			this.pendingChanged.dispatch(true);

			if (this.options.isAutoCancelable) {
				this.cancelIfNeeded();
			}

			this.abortController = new AbortController();

			const result = await this.fn(params, this.abortController.signal);
			this.abortController = null;

			this.pendingChanged.dispatch(false);
			this.notify({ state: "fulfilled", params, result });
			this.fulfilled.dispatch({ params, result });
		} catch (e) {
			const error = e as any;
			if (error.name === "AbortError") return;

			this.pendingChanged.dispatch(false);
			this.notify({ state: "rejected", params, error });
			this.rejected.dispatch({ params, error });
		}
	}

	override on<EntityPayload extends Params>(
		entity: Entity<EntityPayload>,
	): this;
	override on<EntityPayload>(
		entity: Entity<EntityPayload>,
		selector: (payload: EntityPayload) => Params,
	): this;
	override on(
		entity: Entity<any>,
		selector?: ((payload: any) => Params) | undefined,
	): this {
		return super.on(entity, (payload) => {
			this.run(selector ? selector(payload) : payload);
		});
	}

	cancel(): void {
		this.cancelIfNeeded();
		this.pendingChanged.dispatch(false);
		this.abortController = null;
	}

	override release(): void {
		this.cancel();
		this.pending.release();
		this.pendingChanged.release();
		this.fulfilled.release();
		this.rejected.release();
		super.release();
	}
}

export { Effect };
export type { EffectFunction, EffectOptions, NotifyPayload };
