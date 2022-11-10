import { Observable, Observer } from "./observable";

type Subscriber<T> = Observer<T>;

type Unsubscribe = () => void;

abstract class Entity<T> extends Observable<T> {
	protected dependencies = new Map<Entity<any>, Set<Unsubscribe>>();

	protected addDependency<TData>(
		entity: Entity<TData>,
		subscriber: Subscriber<TData>
	) {
		const unsubscribeSet = this.dependencies.get(entity);
		const unsubscribe = entity.subscribe(subscriber);

		if (unsubscribeSet) {
			unsubscribeSet.add(unsubscribe);
		} else {
			this.dependencies.set(entity, new Set([unsubscribe]));
		}
	}

	private deleteDependency(entity: Entity<any>) {
		const unsubscribeSet = this.dependencies.get(entity);
		unsubscribeSet?.forEach((unsubscribe) => unsubscribe());
		unsubscribeSet?.clear();
		this.dependencies.delete(entity);
	}

	inform(data: T): void {
		this.notify(data);
	}

	channel<TTargetPayload extends T | void>(options: {
		target: Entity<TTargetPayload> | Entity<TTargetPayload>[];
	}): void;

	channel<TTargetPayload extends T | void>(options: {
		target: Entity<TTargetPayload> | Entity<TTargetPayload>[];
		filter: (payload: T) => boolean;
	}): void;

	channel<TTargetParams extends any>(options: {
		target: Entity<TTargetParams> | Entity<TTargetParams>[];
		map: (payload: T) => TTargetParams;
	}): void;

	channel<TTargetParams extends any>(options: {
		target: Entity<TTargetParams> | Entity<TTargetParams>[];
		filter: (payload: T) => boolean;
		map: (payload: T) => TTargetParams;
	}): void;

	channel({
		filter,
		map,
		target,
	}: {
		target: Entity<any> | Entity<any>[];
		map?: (payload: T) => any;
		filter?: (payload: T) => boolean;
	}): void {
		const targetList = Array.isArray(target) ? target : [target];

		targetList.forEach((target) => {
			target.addDependency(this, (payload) => {
				const filterResult = filter?.(payload) ?? true;
				if (!filterResult) return;

				target.inform(map?.(payload) ?? payload);
			});
		});
	}

	subscribe(subscriber: Subscriber<T>) {
		return this.observe(subscriber);
	}

	release() {
		super.release();
		[...this.dependencies.keys()].forEach((entity) => {
			this.deleteDependency(entity);
		});
	}
}

export { Entity, Subscriber };
