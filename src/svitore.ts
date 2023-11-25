import { SvitoreModule } from "./svitore-module";
import { Entity } from "./entities/services";
import { Effect, EffectRunner } from "./entities";

class Svitore {
	static modules: SvitoreModule[] = [];

	static createModule<T extends string>(name: T): SvitoreModule<T> {
		const newModule = new SvitoreModule(name);
		this.modules.push(newModule);

		return newModule;
	}

	static resetState(): void {
		this.modules.forEach((module) => {
			module.resetState();
		});
	}

	static release(): void {
		this.modules.forEach((module) => {
			module.release();
		});
	}

	static waitForAsync(): Promise<void> {
		const unsubscribeList: (() => void)[] = [];

		const waitIfNeeded = async (): Promise<void> => {
			const pendingEffects = Entity.ENTITIES.filter(
				(entity) => entity instanceof Effect && entity.isPending.get()
			);
			const runningEffectRunners = Entity.ENTITIES.filter(
				(entity) => entity instanceof EffectRunner && entity.isRunning.get()
			);
			const pendingEntities = [...pendingEffects, ...runningEffectRunners];

			if (!pendingEntities.length) {
				unsubscribeList.forEach((unsubscribe) => unsubscribe());
				return Promise.resolve();
			}

			await Promise.all(
				pendingEntities.map(
					(entity) =>
						new Promise((resolve) =>
							unsubscribeList.push(entity.subscribe(resolve))
						)
				)
			);

			return waitIfNeeded();
		};

		return waitIfNeeded();
	}
}

export { Svitore };
