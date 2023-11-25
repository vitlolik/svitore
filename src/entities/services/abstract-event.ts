import { Entity } from "./entity";

type MiddlewareContext<T> = {
	value: T;
};

type Middleware<T> = (context: MiddlewareContext<T>, next: () => void) => void;

abstract class AbstractEvent<Payload = void> extends Entity<Payload> {
	private middlewares: Middleware<Payload>[] = [];

	private invokeMiddlewares(
		value: Payload,
		dispatch: (context: MiddlewareContext<Payload>) => void
	): void {
		const context: MiddlewareContext<Payload> = { value };

		const invoke = (index: number): void => {
			if (index < this.middlewares.length) {
				this.middlewares[index](context, () => {
					invoke(index + 1);
				});
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

	applyMiddleware(middleware: Middleware<Payload>): this {
		this.middlewares.push(middleware);

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
