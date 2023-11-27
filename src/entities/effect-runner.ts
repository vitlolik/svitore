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
	private unsubscribeFromEffect = (): void => {};
	private isRunningChanged = new Event<boolean>();

	isRunning = new State<boolean>(false).changeOn(this.isRunningChanged);

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

	private getDelayInMilliseconds(
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
		this.unsubscribeFromEffect();
		this.failureCount = 0;
		this.successfulCount = 0;
		globalThis.clearTimeout(this.timer);
	}

	private finish(type: NotifyType): void {
		this.notify(type);
		this.isRunningChanged.dispatch(false);
	}

	start(params: Params): void {
		this.reset();
		this.isRunningChanged.dispatch(true);

		this.unsubscribeFromEffect = this.effect.subscribe((payload) => {
			if (payload.state === "rejected") {
				if (++this.failureCount >= this.options.failureCount) {
					return this.finish("failureLimit");
				}

				return (this.timer = globalThis.setTimeout(() => {
					this.effect.run(params);
				}, this.getDelayInMilliseconds(payload.params, null, payload.error)));
			}

			if (++this.successfulCount >= this.options.successfulCount) {
				return this.finish("successfulLimit");
			}

			return (this.timer = globalThis.setTimeout(() => {
				this.effect.run(params);
			}, this.getDelayInMilliseconds(payload.params, payload.result, null)));
		});

		this.effect.run(params);
	}

	stop(): void {
		this.reset();
		if (!this.isRunning.get()) return;

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
		this.isRunning.release();
		this.isRunningChanged.release();
		super.release();
		this.stop();
	}
}

export { EffectRunner };
