import { AbstractState, Entity } from "./services";
import { SelectorCallback } from "../types";
import { createBatchFunction } from "../utils";

class Reaction<
	States extends ReadonlyArray<AbstractState<any>>
> extends Entity {
	private unsubscribes: (() => void)[] = [];

	constructor(...args: [...States, SelectorCallback<States>]) {
		super();
		const fn = args.pop() as SelectorCallback<States>;
		const states = args as unknown as States;

		const reactionHandler = createBatchFunction(() => {
			fn(...(states.map((state) => state.get()) as any));
		});

		this.unsubscribes = states.map((state) => state.subscribe(reactionHandler));
	}

	release(): void {
		this.unsubscribes.forEach((unsubscribe) => unsubscribe());
		super.release();
	}
}

export { Reaction };
