import { Entity, SelectorCallback, createBatchFunction } from "./shared";
import { State } from "./state";

class Reaction<StateList extends ReadonlyArray<State<any>>> extends Entity {
	private unsubscribeList: (() => void)[] = [];

	constructor(...args: [...StateList, SelectorCallback<StateList>]) {
		super();
		const callback = args.pop() as SelectorCallback<StateList>;
		const stateList = args as unknown as StateList;

		const reactionHandler = createBatchFunction(() => {
			callback(...(stateList.map((state) => state.get()) as any));
		});

		stateList.forEach((state) => {
			this.unsubscribeList.push(state.subscribe(reactionHandler));
		});
	}

	release(): void {
		this.unsubscribeList.forEach((unsubscribe) => unsubscribe());
		super.release();
	}
}

export { Reaction };
