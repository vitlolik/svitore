import {
	Event,
	PersistState,
	State,
	DebouncedEvent,
	ThrottledEvent,
	ComputedState,
	Effect,
	Reaction,
	EffectRunner,
} from "./entities";
import { Entity } from "./entities/services";

class SvitoreModule<T extends string = any> {
	private resetEvent = new Event();
	entities: Entity[] = [];
	modules: SvitoreModule[] = [];

	constructor(public name: T) {}

	private newEntity<T extends Entity<any>>(entity: T): T {
		this.entities.push(entity);

		return entity;
	}

	Module<TNew extends string = any>(
		newName: TNew
	): SvitoreModule<`${T}:${TNew}`> {
		const newModule = new SvitoreModule<`${T}:${TNew}`>(
			`${this.name}:${newName}`
		);
		this.modules.push(newModule);

		return newModule;
	}

	State<T>(...args: ConstructorParameters<typeof State<T>>): State<T> {
		return this.newEntity(new State(...args).resetOn(this.resetEvent));
	}

	ComputedState<StateList extends ReadonlyArray<State<any>>, T>(
		...args: ConstructorParameters<typeof ComputedState<StateList, T>>
	): ComputedState<StateList, T> {
		return this.newEntity(new ComputedState(...args));
	}

	PersistState<T>(
		...args: ConstructorParameters<typeof PersistState<T>>
	): PersistState<T> {
		return this.newEntity(new PersistState(...args).resetOn(this.resetEvent));
	}

	Event<T = void>(): Event<T> {
		return this.newEntity(new Event());
	}

	DebouncedEvent<T = void>(
		...args: ConstructorParameters<typeof DebouncedEvent<T>>
	): DebouncedEvent<T> {
		return this.newEntity(new DebouncedEvent(...args));
	}

	ThrottledEvent<T = void>(
		...args: ConstructorParameters<typeof ThrottledEvent<T>>
	): ThrottledEvent<T> {
		return this.newEntity(new ThrottledEvent(...args));
	}

	Effect<Params = void, Result = void, ErrorType extends Error = Error>(
		...args: ConstructorParameters<typeof Effect<Params, Result, ErrorType>>
	): Effect<Params, Result, ErrorType> {
		return this.newEntity(new Effect(...args));
	}

	EffectRunner<Params = void, Result = void, ErrorType extends Error = Error>(
		...args: ConstructorParameters<
			typeof EffectRunner<Params, Result, ErrorType>
		>
	): EffectRunner<Params, Result, ErrorType> {
		return this.newEntity(new EffectRunner(...args));
	}

	Reaction<T extends ReadonlyArray<State<any>>>(
		...args: ConstructorParameters<typeof Reaction<T>>
	): Reaction<T> {
		return this.newEntity(new Reaction(...args));
	}

	reset(): void {
		for (const module of this.modules) {
			module.reset();
		}

		this.resetEvent.dispatch();
	}

	release(): void {
		for (const module of this.modules) {
			module.release();
		}

		for (const entity of this.entities) {
			entity.release();
		}
	}
}

export { SvitoreModule };
