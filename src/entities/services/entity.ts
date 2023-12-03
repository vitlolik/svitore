import { logError } from "../../utils";

type Subscriber<T = void> = (data: T) => void;

abstract class Entity<T = void> {
	private subscribers: Set<Subscriber<T>> = new Set();
	private triggerMap: Map<Entity<any>, () => void> = new Map();

	subscribe(subscriber: Subscriber<T>): () => void {
		this.subscribers.add(subscriber);

		return () => this.unsubscribe(subscriber);
	}

	unsubscribe(subscriber: Subscriber<T> | Entity<any>): void {
		if (subscriber instanceof Entity) {
			this.triggerMap.get(subscriber)?.();
			return void this.triggerMap.delete(subscriber);
		}

		this.subscribers.delete(subscriber);
	}

	protected notify(params: T): void {
		for (const subscriber of this.subscribers) {
			try {
				subscriber(params);
			} catch (error) {
				logError("Entity", "Some subscriber have an error", error);
			}
		}
	}

	protected trigger<EntityPayload>(
		entity: Entity<EntityPayload>,
		subscriber: (payload: EntityPayload) => void
	): this {
		if (this.triggerMap.has(entity)) return this;

		this.triggerMap.set(entity, entity.subscribe(subscriber));

		return this;
	}

	release(): void {
		for (const unsubscribe of this.triggerMap.values()) {
			unsubscribe();
		}

		this.triggerMap.clear();
		this.subscribers.clear();
	}
}

export { Entity };
