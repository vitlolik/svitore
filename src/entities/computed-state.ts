import { SelectorCallback } from "../types";
import { AbstractState } from "./services";

class ComputedState<
	StateList extends ReadonlyArray<AbstractState<any>>,
	Data
> extends AbstractState<Data> {
	private unsubscribeList: (() => void)[] = [];

	constructor(...args: [...StateList, SelectorCallback<StateList, Data>]) {
		const selector = args.pop() as SelectorCallback<StateList, Data>;
		const stateList = args as unknown as StateList;

		const getStateData = (): Data =>
			selector(...(stateList.map((state) => state.get()) as any));

		super(getStateData());

		stateList.forEach((state) => {
			this.unsubscribeList.push(
				state.subscribe(() => super.notify(getStateData()))
			);
		});
	}

	release(): void {
		this.unsubscribeList.forEach((unsubscribe) => unsubscribe());
		super.release();
	}
}

export { ComputedState };
