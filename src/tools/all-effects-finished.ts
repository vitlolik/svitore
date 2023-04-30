import { Entity } from "../shared";
import { Effect } from "../effect";

const allEffectsFinished = async (): Promise<void> => {
	const unsubscribeList: (() => void)[] = [];

	const worker = async (): Promise<void> => {
		const pendingEffects = Entity.createdEntities.filter(
			(entity) => entity instanceof Effect && entity.isPending.get()
		) as Effect<any>[];

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

		return worker();
	};

	return worker();
};

export { allEffectsFinished };
