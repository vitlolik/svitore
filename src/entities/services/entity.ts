import { Observable, Observer } from "./observable";
import { generateId } from "../../utils";

abstract class Entity<T = void> extends Observable<T> {
	protected id: number;
	private onMap: Map<Entity<any>, () => void> = new Map();
	static ENTITIES: Entity<any>[] = [];

	constructor() {
		super();
		this.id = generateId.next().value;
		Entity.ENTITIES.push(this);
	}

	subscribe(subscriber: Observer<T>): () => void {
		return this.observe(subscriber);
	}

	protected trigger<EntityPayload>(
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
		super.release();
	}
}

export { Entity };
