import { Observable, Observer } from "./observable";

let id = 0;

abstract class Entity<T = void> extends Observable<T> {
	readonly id: number;
	private triggerMap: Map<Entity<any>, () => void> = new Map();
	static readonly ENTITIES: Entity<any>[] = [];

	constructor() {
		super();
		this.id = id++;
		Entity.ENTITIES.push(this);
	}

	subscribe(subscriber: Observer<T>): () => void {
		return this.observe(subscriber);
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
		super.release();
	}
}

export { Entity };
