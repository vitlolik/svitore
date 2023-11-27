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

	private invokeMiddlewares(
		value: Payload,
		dispatch: (context: MiddlewareContext<Payload>) => void
	): void {
		const context: MiddlewareContext<Payload> = { value };

		const invoke = (index: number): void => {
			if (index < this.middlewares.length) {
				const { fn, errorEvent } = this.middlewares[index];

				try {
					fn(context, () => {
						invoke(index + 1);
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

		invoke(0);
	}

	dispatch(payload: Payload): void {
		this.invokeMiddlewares(payload, ({ value }) => {
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

	trigger<EntityPayload extends Payload>(entity: Entity<EntityPayload>): this;
	trigger<EntityPayload>(
		entity: Entity<EntityPayload>,
		selector: (payload: EntityPayload) => Payload
	): this;
	trigger(entity: Entity<any>, selector?: (payload: any) => Payload): this {
		return super.trigger(entity, (payload) => {
			this.dispatch(selector ? selector(payload) : payload);
		});
	}
}

export { AbstractEvent };
export type { Middleware };
