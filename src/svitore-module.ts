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
	private resetStateEvent = new Event();
	entities: Entity[] = [];

	constructor(public name: T) {}

	private createEntity<T extends Entity<any>>(entity: T): T {
		this.entities.push(entity);

		return entity;
	}

	createState<T>(...args: ConstructorParameters<typeof State<T>>): State<T> {
		return this.createEntity(new State(...args).resetOn(this.resetStateEvent));
	}

	createComputedState<StateList extends ReadonlyArray<State<any>>, T>(
		...args: ConstructorParameters<typeof ComputedState<StateList, T>>
	): ComputedState<StateList, T> {
		return this.createEntity(new ComputedState(...args));
	}

	createPersistState<T>(
		...args: ConstructorParameters<typeof PersistState<T>>
	): PersistState<T> {
		return this.createEntity(
			new PersistState(...args).resetOn(this.resetStateEvent)
		);
	}

	createEvent<T = void>(): Event<T> {
		return this.createEntity(new Event());
	}

	createDebouncedEvent<T = void>(
		...args: ConstructorParameters<typeof DebouncedEvent<T>>
	): DebouncedEvent<T> {
		return this.createEntity(new DebouncedEvent(...args));
	}

	createThrottledEvent<T = void>(
		...args: ConstructorParameters<typeof ThrottledEvent<T>>
	): ThrottledEvent<T> {
		return this.createEntity(new ThrottledEvent(...args));
	}

	createEffect<Params = void, Result = void, Error = void>(
		...args: ConstructorParameters<typeof Effect<Params, Result, Error>>
	): Effect<Params, Result, Error> {
		return this.createEntity(new Effect(...args));
	}

	createReaction<T extends ReadonlyArray<State<any>>>(
		...args: ConstructorParameters<typeof Reaction<T>>
	): Reaction<T> {
		return this.createEntity(new Reaction(...args));
	}

	resetState(): void {
		this.resetStateEvent.dispatch();
	}

	release(): void {
		this.entities.forEach((entity) => {
			entity.release();
		});
	}
}

export { SvitoreModule };
