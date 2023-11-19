import { SvitoreModule } from "./svitore-module";
import { Entity } from "./entities/services";
import { isEffect } from "./type-guards";

class Svitore {
	static modules: SvitoreModule[] = [];

	static waitForEffects(): Promise<void> {
		const unsubscribeList: (() => void)[] = [];

		const waitIfNeeded = async (): Promise<void> => {
			const pendingEffects = Entity.ENTITIES.filter(
				(entity) => isEffect(entity) && entity.isPending.get()
			);

			if (!pendingEffects.length) {
				unsubscribeList.forEach((unsubscribe) => unsubscribe());
				return Promise.resolve();
			}

			await Promise.all(
				pendingEffects.map(
					(effect) =>
						new Promise((resolve) => {
							unsubscribeList.push(effect.subscribe(resolve));
						})
				)
			);

			return waitIfNeeded();
		};

		return waitIfNeeded();
	}

	static initModule<T extends string>(name: T): SvitoreModule<T> {
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
}

export { Svitore };
