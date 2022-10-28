import { Observable, Observer } from "./observable";

type Subscriber<T> = Observer<T>;

abstract class Entity<T> extends Observable<T> {
	protected dependencies = new Map<Entity<any>, () => void>();

	protected addDependency<TData>(
		entity: Entity<TData>,
		subscriber: Subscriber<TData>
	) {
		this.dependencies.set(entity, entity.subscribe(subscriber));
	}

	protected deleteDependency(entity: Entity<any>) {
		const unsubscribe = this.dependencies.get(entity);
		unsubscribe?.();
		this.dependencies.delete(entity);
	}

	protected off(entity: Entity<any>) {
		this.deleteDependency(entity);

		return this;
	}

	inform(data: T): void {
		this.notify(data);
	}

	channel<TTargetPayload extends T | void>(options: {
		target: Entity<TTargetPayload> | Entity<TTargetPayload>[];
	}): () => void;

	channel<TTargetPayload extends T | void>(options: {
		target: Entity<TTargetPayload> | Entity<TTargetPayload>[];
		filter: (payload: T) => boolean;
	}): () => void;

	channel<TTargetParams extends any>(options: {
		target: Entity<TTargetParams> | Entity<TTargetParams>[];
		map: (payload: T) => TTargetParams;
	}): () => void;

	channel<TTargetParams extends any>(options: {
		target: Entity<TTargetParams> | Entity<TTargetParams>[];
		filter: (payload: T) => boolean;
		map: (payload: T) => TTargetParams;
	}): () => void;

	channel({
		filter,
		map,
		target,
	}: {
		target: Entity<any> | Entity<any>[];
		map?: (payload: T) => any;
		filter?: (payload: T) => boolean;
	}): () => void {
		const targetList = Array.isArray(target) ? target : [target];

		targetList.forEach((target) => {
			target.addDependency(this, (payload) => {
				const filterResult = filter?.(payload) ?? true;
				if (!filterResult) return;

				target.inform(map?.(payload) ?? payload);
			});
		});

		return () => {
			targetList.forEach((target) => {
				target.off(this);
			});
		};
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
