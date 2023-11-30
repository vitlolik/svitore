import { Effect } from "./effect";
import { Event } from "./event";
import { Entity } from "./services";
import { State } from "./state";

type CallbackParams<Params, Result, ErrorType> = {
	rejected: number;
	fulfilled: number;
	params: Params;
	result: Result | null;
	error: ErrorType | null;
};

type EffectRunnerOptions<Params, Result, ErrorType> = {
	delay: (params: CallbackParams<Params, Result, ErrorType>) => number;
	while: (params: CallbackParams<Params, Result, ErrorType>) => boolean;
};

type NotifyType = "stopped" | "finished";

class EffectRunner<
	Params = void,
	Result = void,
	ErrorType extends Error = Error
> extends Entity<NotifyType> {
	private rejected = 0;
	private fulfilled = 0;
	private timer: number | NodeJS.Timeout = NaN;
	private unsubscribe = (): void => {};
	private changed = new Event<boolean>();

	readonly pending = new State<boolean>(false).changeOn(this.changed);

	constructor(
		private effect: Effect<Params, Result, ErrorType>,
		private options: EffectRunnerOptions<Params, Result, ErrorType>
	) {
		super();
	}

	private reset(): void {
		this.unsubscribe();
		this.rejected = 0;
		this.fulfilled = 0;
		globalThis.clearTimeout(this.timer);
	}

	private end(type: NotifyType): void {
		this.notify(type);
		this.changed.dispatch(false);
	}

	start(params: Params): void {
		this.reset();
		this.changed.dispatch(true);

		this.unsubscribe = this.effect.subscribe((payload) => {
			let result: Result | null = null;
			let error: ErrorType | null = null;

			if (payload.state === "rejected") {
				this.rejected++;
				error = payload.error;
			} else {
				this.fulfilled++;
				result = payload.result;
			}

			const callbackParams: CallbackParams<Params, Result, ErrorType> = {
				rejected: this.rejected,
				fulfilled: this.fulfilled,
				params,
				result,
				error,
			};

			if (!this.options.while(callbackParams)) {
				return this.end("finished");
			}

			this.timer = globalThis.setTimeout(() => {
				this.effect.run(params);
			}, this.options.delay(callbackParams));
		});

		this.effect.run(params);
	}

	stop(): void {
		this.reset();
		if (!this.pending.get()) return;

		this.effect.cancel();
		this.end("stopped");
	}

	trigger<EntityPayload extends Params>(entity: Entity<EntityPayload>): this;
	trigger<EntityPayload>(
		entity: Entity<EntityPayload>,
		selector: (payload: EntityPayload) => Params
	): this;
	trigger(
		entity: Entity<any>,
		selector?: ((payload: any) => Params) | undefined
	): this {
		return super.trigger(entity, (payload) => {
			this.start(selector ? selector(payload) : payload);
		});
	}

	release(): void {
		this.pending.release();
		this.changed.release();
		super.release();
		this.stop();
	}
}

export { EffectRunner };
