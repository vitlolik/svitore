import { Entity } from "./entity";

type MiddlewareContext<T> = {
	value: T;
};

type Middleware<T> = (context: MiddlewareContext<T>, next: () => void) => void;

abstract class AbstractEvent<Payload = void> extends Entity<Payload> {
	private middlewares: {
		fn: Middleware<Payload>;
		errorEvent?: AbstractEvent<any>;
	}[] = [];

	private callMiddlewares(
		value: Payload,
		dispatch: (context: MiddlewareContext<Payload>) => void
	): void {
		const context: MiddlewareContext<Payload> = { value };

		const call = (index: number): void => {
			if (index < this.middlewares.length) {
				const { fn, errorEvent } = this.middlewares[index];

				try {
					fn(context, () => {
						call(index + 1);
					});
				} catch (error) {
					if (!errorEvent) {
						throw error;
					}

					errorEvent.dispatch(error);
				}
			} else {
				dispatch(context);
			}
		};

		call(0);
	}

	dispatch(payload: Payload): void {
		this.callMiddlewares(payload, ({ value }) => {
			this.notify(value);
		});
	}

	applyMiddleware<ErrorType extends Error>(
		middleware: Middleware<Payload>,
		errorEvent?: AbstractEvent<ErrorType>
	): this {
		this.middlewares.push({ fn: middleware, errorEvent });

		return this;
	}

	on<EntityPayload extends Payload>(entity: Entity<EntityPayload>): this;
	on<EntityPayload>(
		entity: Entity<EntityPayload>,
		selector: (payload: EntityPayload) => Payload
	): this;
	on(entity: Entity<any>, selector?: (payload: any) => Payload): this {
		return super.on(entity, (payload) => {
			this.dispatch(selector ? selector(payload) : payload);
		});
	}

	release(): void {
		this.middlewares = [];
		super.release();
	}
}

export { AbstractEvent };
export type { Middleware };
