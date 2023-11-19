import {
	Event,
	PersistState,
	State,
	DebouncedEvent,
	ThrottledEvent,
	ComputedState,
	Effect,
	Reaction,
} from "./entities";
import { Entity } from "./entities/services";

class SvitoreModule<T extends string = any> {
	resetState = new Event();
	entities: Entity[] = [];

	constructor(public name: T) {}

	private addEntity<T extends Entity<any>>(entity: T): T {
		this.entities.push(entity);

		return entity;
	}

	initState<T>(...args: ConstructorParameters<typeof State<T>>): State<T> {
		return this.addEntity(new State(...args).resetOn(this.resetState));
	}

	initComputedState<StateList extends ReadonlyArray<State<any>>, T>(
		...args: ConstructorParameters<typeof ComputedState<StateList, T>>
	): ComputedState<StateList, T> {
		return this.addEntity(new ComputedState(...args));
	}

	initPersistState<T>(
		...args: ConstructorParameters<typeof PersistState<T>>
	): PersistState<T> {
		return this.addEntity(new PersistState(...args).resetOn(this.resetState));
	}

	initEvent<T = void>(): Event<T> {
		return this.addEntity(new Event());
	}

	initDebouncedEvent<T = void>(
		...args: ConstructorParameters<typeof DebouncedEvent<T>>
	): DebouncedEvent<T> {
		return this.addEntity(new DebouncedEvent(...args));
	}

	initThrottledEvent<T = void>(
		...args: ConstructorParameters<typeof ThrottledEvent<T>>
	): ThrottledEvent<T> {
		return this.addEntity(new ThrottledEvent(...args));
	}

	initEffect<Params = void, Result = void, Error = void>(
		...args: ConstructorParameters<typeof Effect<Params, Result, Error>>
	): Effect<Params, Result, Error> {
		return this.addEntity(new Effect(...args));
	}

	initReaction<T extends ReadonlyArray<State<any>>>(
		...args: ConstructorParameters<typeof Reaction<T>>
	): Reaction<T> {
		return this.addEntity(new Reaction(...args));
	}

	release(): void {
		this.entities.forEach((entity) => {
			entity.release();
		});
	}
}

export { SvitoreModule };
