import { Observable, Observer } from "./observable";
import { generateId } from "../../utils";

abstract class Entity<T = void> extends Observable<T> {
	protected id: number;
	static ENTITIES: Entity<any>[] = [];

	constructor() {
		super();
		this.id = generateId.next().value;
		Entity.ENTITIES.push(this);
	}

	subscribe(subscriber: Observer<T>): () => void {
		return this.observe(subscriber);
	}
}

export { Entity };
