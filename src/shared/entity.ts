import { Observable, Observer } from "./observable";

type Subscriber<T> = Observer<T>;

type Unsubscribe = () => void;

abstract class Entity<T> extends Observable<T> {
	static createdEntities: Entity<any>[] = [];
	protected dependencies = new Map<Entity<any>, Set<Unsubscribe>>();

	constructor() {
		super();

		Entity.createdEntities.push(this);
	}

	subscribe(subscriber: Subscriber<T>) {
		return this.observe(subscriber);
	}
}

export { Entity, Subscriber };
