import { createBatchFunction } from "../utils";
import { type AbstractState, Entity } from "./services";
import type { ExtractEntitiesTypes } from "./types";

class Reaction<States extends ReadonlyArray<AbstractState<any>>> extends Entity<
	ExtractEntitiesTypes<States>
> {
	private unsubscribes: (() => void)[] = [];

	constructor(states: States) {
		super();

		const reactionHandler = createBatchFunction(() => {
			if (this.subscribers.size) {
				this.notify(states.map((state) => state.get()) as any);
			}
		});

		this.unsubscribes = states.map((state) => state.subscribe(reactionHandler));
	}

	override release(): void {
		for (const unsubscribe of this.unsubscribes) {
			unsubscribe();
		}

		super.release();
	}
}

export { Reaction };
