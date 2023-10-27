import { Entity, logError } from "./shared";
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

	private callMiddlewares(payload: Payload): Payload {
		let result: Payload = payload;

		for (const middleware of this.middlewareChain) {
			result = middleware.call(result);
		}

		return result;
	}

	private shouldDispatch(): boolean {
		return this.options.shouldDispatch?.(this) ?? true;
	}

	dispatch(payload: Payload): void {
		if (!this.shouldDispatch()) return;

		try {
			const newPayload = this.callMiddlewares(payload);
			this.calls++;
			this.notify(newPayload);
		} catch (error) {
			logError(error);
		}
	}

	setMiddlewareChain(middlewareChain: Middleware<Payload>[]): this {
		this.middlewareChain = middlewareChain;
		return this;
	}
}

export { Event, EventOptions };
