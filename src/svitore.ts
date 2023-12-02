import { SvitoreModule } from "./svitore-module";
import { DelayedEvent, Entity } from "./entities/services";
import { Effect, EffectRunner } from "./entities";
import { ModuleExistsError } from "./utils/error";

class Svitore {
	static readonly modules: Map<string, SvitoreModule> = new Map();

	static Module<T extends string>(name: T): SvitoreModule<T> {
		if (this.modules.has(name)) {
			throw new ModuleExistsError(name);
		}

		const newModule = new SvitoreModule(name);
		this.modules.set(name, newModule);

		return newModule;
	}

	static reset(): void {
		for (const module of this.modules.values()) {
			module.reset();
		}
	}

	static release(): void {
		for (const module of this.modules.values()) {
			module.release();
		}

		this.modules.clear();
	}

	static allSettled(): Promise<void> {
		const unsubscribes: (() => void)[] = [];

		const waitIfNeeded = async (): Promise<void> => {
			const pendingEffects = Entity.ENTITIES.filter(
				(entity) => entity instanceof Effect && entity.pending.get()
			);
			const pendingEffectRunners = Entity.ENTITIES.filter(
				(entity) => entity instanceof EffectRunner && entity.pending.get()
			);
			const pendingEvents = Entity.ENTITIES.filter(
				(entity) => entity instanceof DelayedEvent && entity.pending
			);

			const pendingEntities = [
				...pendingEffects,
				...pendingEffectRunners,
				...pendingEvents,
			];

			if (!pendingEntities.length) {
				for (const unsubscribe of unsubscribes) {
					unsubscribe();
				}
				return Promise.resolve();
			}

			await Promise.all(
				pendingEntities.map(
					(entity) =>
						new Promise((resolve) =>
							unsubscribes.push(entity.subscribe(resolve))
						)
				)
			);

			return waitIfNeeded();
		};

		return waitIfNeeded();
	}
}

export { Svitore };
