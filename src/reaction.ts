import { Entity, createBatchFunction } from "./shared";
import { State } from "./state";

type ExtractStateType<T extends ReadonlyArray<State<any>>> = {
	[K in keyof T]: T[K] extends State<infer U> ? U : never;
};

type ReactionCallback<StateList extends ReadonlyArray<State<any>>> = (
	...args: ExtractStateType<StateList>
) => void;

class Reaction<StateList extends ReadonlyArray<State<any>>> extends Entity {
	private unsubscribeList: (() => void)[] = [];

	constructor(...args: [...StateList, ReactionCallback<StateList>]) {
		super();
		const callback = args.pop() as ReactionCallback<StateList>;
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
