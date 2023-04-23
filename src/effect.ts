import { Entity } from "./shared/entity";

type EffectFunction<Params, Result> = (
	params: Params,
	abortController: AbortController
) => Promise<Result>;

enum Status {
	idle,
	pending,
	resolved,
	rejected,
}

type EffectSubscribePayload<Params, Result, ErrorType> =
	| {
			status: "pending";
			params: Params;
	  }
	| {
			status: "resolved";
			params: Params;
			result: Result;
	  }
	| { status: "rejected"; params: Params; error: ErrorType }
	| { status: "finished"; params: Params };

class Effect<
	Params = void,
	Result = void,
	ErrorType extends Error = Error
> extends Entity<EffectSubscribePayload<Params, Result, ErrorType>> {
	private isAborted = false;
	private status = Status.idle;

	private prevAbortController = new AbortController();
	private abortController = new AbortController();

	constructor(private effectFunction: EffectFunction<Params, Result>) {
		super();
	}

	clone(): Effect<Params, Result, ErrorType> {
		return new Effect(this.effectFunction);
	}

	implement(effectFunction: EffectFunction<Params, Result>): void {
		this.effectFunction = effectFunction;
	}

	async run(params: Params): Promise<void> {
		try {
			this.abort();
			this.prevAbortController = this.abortController;
			this.abortController = new AbortController();

			this.status = Status.pending;
			this.notify({ status: "pending", params });

			const result = await this.effectFunction(params, this.abortController);

			this.status = Status.resolved;
			this.notify({ status: "resolved", params, result });
		} catch (e) {
			const error = e as ErrorType;
			if (error.name === "AbortError") return;

			this.status = Status.rejected;
			this.notify({ status: "rejected", params, error });
		} finally {
			if (this.isAborted) {
				this.isAborted = false;
			} else this.notify({ status: "finished", params });
		}
	}

	get isPending(): boolean {
		return this.status === Status.pending;
	}

	abort(): void {
		if (!this.prevAbortController.signal.aborted) {
			this.prevAbortController.abort();
		}
		if (!this.abortController.signal.aborted) {
			this.abortController.abort();
		}
		this.isAborted = true;
	}

	release(): void {
		this.abort();
		super.release();
	}
}

export { Effect, EffectFunction, Status as EffectStatus };
