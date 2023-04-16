import { Observable } from "./observable";

abstract class Entity<T> extends Observable<T> {
	static createdEntities: Entity<any>[] = [];

	constructor() {
		super();

		Entity.createdEntities.push(this);
	}
}

export { Entity };
