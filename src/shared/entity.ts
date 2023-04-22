import { Observable, Observer } from "./observable";

abstract class Entity<T = void> extends Observable<T> {
	static createdEntities: Entity<any>[] = [];

	constructor() {
		super();

		Entity.createdEntities.push(this);
	}

	subscribe(subscriber: Observer<T>): () => void {
		return this.observe(subscriber);
	}
}

export { Entity };
