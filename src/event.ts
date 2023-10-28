import { Entity } from "./shared";
import { Middleware } from "./middleware";

type EventOptions<Payload = void> = {
	[x: string]: any;
	shouldDispatch?: (event: Event<Payload>) => boolean;
};

class Event<Payload = void> extends Entity<Payload> {
	private middlewareChain: Middleware<Payload>[] = [];
	calls = 0;

	constructor(public options: EventOptions<Payload> = {}) {
		super();
	}

	private callMiddlewares(payload: Payload): {
		hasError: boolean;
		payload: Payload;
	} {
		let result: Payload = payload;
		let hasError = false;

		for (const middleware of this.middlewareChain) {
			const middlewareResult = middleware.call(result);
			hasError = middlewareResult.hasError;
			if (hasError) break;

			result = middlewareResult.payload;
		}

		return { hasError, payload: result };
	}

	private shouldDispatch(): boolean {
		return this.options.shouldDispatch?.(this) ?? true;
	}

	dispatch(payload: Payload): void {
		if (!this.shouldDispatch()) return;

		const result = this.callMiddlewares(payload);
		if (result.hasError) return;

		this.calls++;
		this.notify(result.payload);
	}

	setMiddlewareChain(middlewareChain: Middleware<Payload>[]): this {
		this.middlewareChain = middlewareChain;
		return this;
	}
}

export { Event, EventOptions };
