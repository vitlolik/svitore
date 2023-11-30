import { Effect } from "./effect";
import { Event } from "./event";
import { Entity } from "./services";
import { State } from "./state";

type DelayParams<Params, Result, ErrorType> = {
	failureCount: number;
	successfulCount: number;
	params: Params;
	result: Result | null;
	error: ErrorType | null;
};

type EffectRunnerOptions<Params, Result, ErrorType> = {
	delay: number | ((params: DelayParams<Params, Result, ErrorType>) => number);
	failureCount?: number;
	successfulCount?: number;
};

type NotifyType = "failureLimit" | "successfulLimit" | "stopped";

class EffectRunner<
	Params = void,
	Result = void,
	ErrorType extends Error = Error
> extends Entity<NotifyType> {
	private options: Required<EffectRunnerOptions<Params, Result, ErrorType>>;
	private failureCount = 0;
	private successfulCount = 0;
	private timer: number | NodeJS.Timeout = NaN;
	private unsubscribe = (): void => {};
	private changed = new Event<boolean>();

	readonly pending = new State<boolean>(false).changeOn(this.changed);

	constructor(
		private effect: Effect<Params, Result, ErrorType>,
		options: EffectRunnerOptions<Params, Result, ErrorType>
	) {
		super();

		this.options = {
			...options,
			failureCount: this.parseCount(options.failureCount),
			successfulCount: this.parseCount(options.successfulCount),
		};
	}

	private parseCount(count?: number): number {
		if (count === undefined) return Infinity;

		return count < 0 ? 0 : count;
	}

	private getDelay(
		params: Params,
		result: Result | null,
		error: ErrorType | null
	): number {
		const { delay } = this.options;

		return typeof delay === "number"
			? delay
			: delay({
					failureCount: this.failureCount,
					successfulCount: this.successfulCount,
					params,
					result,
					error,
			  });
	}

	private reset(): void {
		this.unsubscribe();
		this.failureCount = 0;
		this.successfulCount = 0;
		globalThis.clearTimeout(this.timer);
	}

	private finish(type: NotifyType): void {
		this.notify(type);
		this.changed.dispatch(false);
	}

	start(params: Params): void {
		this.reset();
		this.changed.dispatch(true);

		this.unsubscribe = this.effect.subscribe((payload) => {
			if (payload.state === "rejected") {
				if (++this.failureCount >= this.options.failureCount) {
					return this.finish("failureLimit");
				}

				return (this.timer = globalThis.setTimeout(() => {
					this.effect.run(params);
				}, this.getDelay(payload.params, null, payload.error)));
			}

			if (++this.successfulCount >= this.options.successfulCount) {
				return this.finish("successfulLimit");
			}

			return (this.timer = globalThis.setTimeout(() => {
				this.effect.run(params);
			}, this.getDelay(payload.params, payload.result, null)));
		});

		this.effect.run(params);
	}

	stop(): void {
		this.reset();
		if (!this.pending.get()) return;

		this.effect.cancel();
		this.finish("stopped");
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
