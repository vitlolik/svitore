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
import { ModuleExistsError } from "./utils/error";

class SvitoreModule<T extends string = any> {
	static MODULES: Map<string, SvitoreModule> = new Map();

	private resetEvent = new Event();
	readonly modules: Map<string, SvitoreModule> = new Map();
	readonly entities: Set<Entity> = new Set();

	constructor(public name: T) {
		const { MODULES } = SvitoreModule;

		if (MODULES.has(name)) {
			throw new ModuleExistsError(name);
		}

		SvitoreModule.MODULES.set(name, this);
	}

	private newEntity<T extends Entity<any>>(entity: T): T {
		this.entities.add(entity);

		return entity;
	}

	Module<Name extends string = any>(name: Name): SvitoreModule<`${T}:${Name}`> {
		type ModuleType = `${T}:${Name}`;
		const moduleName: ModuleType = `${this.name}:${name}`;

		const newModule = new SvitoreModule<ModuleType>(`${this.name}:${name}`);
		this.modules.set(moduleName, newModule);

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
		for (const module of this.modules.values()) {
			module.reset();
		}

		this.resetEvent.dispatch();
	}

	release(): void {
		for (const module of this.modules.values()) {
			module.release();
		}
		this.modules.clear();

		for (const entity of this.entities) {
			entity.release();
		}
		this.entities.clear();
	}
}

export { SvitoreModule };
