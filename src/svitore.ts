import { SvitoreModule } from "./svitore-module";
import { DelayedEvent, Entity } from "./entities/services";
import { Effect, EffectRunner } from "./entities";

class Svitore {
	static modules: SvitoreModule[] = [];

	static Module<T extends string>(name: T): SvitoreModule<T> {
		const newModule = new SvitoreModule(name);
		this.modules.push(newModule);

		return newModule;
	}

	static reset(): void {
		for (const module of this.modules) {
			module.reset();
		}
	}

	static release(): void {
		for (const module of this.modules) {
			module.release();
		}
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
