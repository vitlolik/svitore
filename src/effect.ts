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
	| {
			status: "aborted";
			params: Params;
			error: Error;
	  }
	| { status: "finished"; params: Params };

class Effect<
	Params = void,
	Result = void,
	ErrorType extends Error = Error
> extends Entity<EffectSubscribePayload<Params, Result, ErrorType>> {
	private status = Status.idle;
	private abortControllerList: AbortController[] = [];

	constructor(private effectFunction: EffectFunction<Params, Result>) {
		super();
	}

	implement(effectFunction: EffectFunction<Params, Result>): void {
		this.effectFunction = effectFunction;
	}

	async run(params: Params): Promise<void> {
		try {
			this.abort();
			const abortController = new AbortController();
			this.abortControllerList.push(abortController);

			this.status = Status.pending;
			this.notify({ status: "pending", params });

			const result = await this.effectFunction(params, abortController);
			this.abortControllerList.length = 0;

			this.status = Status.resolved;
			this.notify({ status: "resolved", params, result });
		} catch (e) {
			const error = e as ErrorType;

			if (error.name === "AbortError") {
				this.notify({ status: "aborted", params, error });
			} else {
				this.status = Status.rejected;
				this.notify({ status: "rejected", params, error });
			}
		} finally {
			this.notify({ status: "finished", params });
		}
	}

	get isPending(): boolean {
		return this.status === Status.pending;
	}

	abort(): void {
		if (this.isPending) {
			this.abortControllerList.forEach((controller) => controller.abort());
		}
	}

	release(): void {
		this.abort();
		super.release();
	}
}

export { Effect, EffectFunction, Status as EffectStatus };
