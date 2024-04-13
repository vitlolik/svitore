import { Effect, EffectRunner, type Entity } from "./entities";
import { DelayedEvent } from "./entities/services";
import { SvitoreModule } from "./svitore-module";

const getAllModules = (): SvitoreModule[] => {
	return [...SvitoreModule.MODULES.values()];
};

const getAllEntities = (): Entity[] => {
	let result: Entity[] = [];
	let modules = getAllModules();

	while (modules.length) {
		const module = modules.pop() as SvitoreModule;
		result = result.concat(...module.entities.values());
		modules = modules.concat(...module.modules.values());
	}

	return result;
};

const reset = (): void => {
	for (const module of getAllModules()) {
		module.reset();
	}
};

const release = (): void => {
	for (const module of getAllModules()) {
		module.release();
	}

	SvitoreModule.MODULES.clear();
};

const allSettled = async (): Promise<void> => {
	const unsubscribes: (() => void)[] = [];
	const entities = getAllEntities();

	const waitIfNeeded = async (): Promise<void> => {
		const pendingEffects = entities.filter(
			(entity) => entity instanceof Effect && entity.pending.get(),
		);
		const pendingEffectRunners = entities.filter(
			(entity) => entity instanceof EffectRunner && entity.pending.get(),
		);
		const pendingEvents = entities.filter(
			(entity) => entity instanceof DelayedEvent && entity.pending,
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
						unsubscribes.push(entity.subscribe(resolve)),
					),
			),
		);

		return waitIfNeeded();
	};

	return waitIfNeeded();
};

export { reset, release, allSettled };
