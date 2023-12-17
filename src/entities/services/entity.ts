import { logError } from "../../utils";

type Subscriber<T = void> = (data: T) => void;

abstract class Entity<T = void> {
	protected subscribers: Set<Subscriber<T>> = new Set();
	private onMap: Map<Entity<any>, () => void> = new Map();

	subscribe(subscriber: Subscriber<T>): () => void {
		this.subscribers.add(subscriber);

		return () => this.unsubscribe(subscriber);
	}

	unsubscribe(subscriber: Subscriber<T> | Entity<T>): void {
		if (subscriber instanceof Entity) {
			this.onMap.get(subscriber)?.();
			return void this.onMap.delete(subscriber);
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

	protected on<EntityPayload>(
		entity: Entity<EntityPayload>,
		subscriber: (payload: EntityPayload) => void
	): this {
		if (this.onMap.has(entity)) return this;

		this.onMap.set(entity, entity.subscribe(subscriber));

		return this;
	}

	release(): void {
		for (const unsubscribe of this.onMap.values()) {
			unsubscribe();
		}

		this.onMap.clear();
		this.subscribers.clear();
	}
}

export { Entity };
