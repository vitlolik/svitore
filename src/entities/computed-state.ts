import { SelectorCallback } from "../types";
import { SvitoreError } from "../utils";
import { State } from "./state";

const throwComputedStateError = (): never => {
	throw new SvitoreError("ComputedState is read-only, you must not change it");
};

class ComputedState<
	StateList extends ReadonlyArray<State<any>>,
	Data
> extends State<Data> {
	private unsubscribeList: (() => void)[] = [];

	constructor(...args: [...StateList, SelectorCallback<StateList, Data>]) {
		const selector = args.pop() as SelectorCallback<StateList, Data>;
		const stateList = args as unknown as StateList;

		const getStateData = (): Data =>
			selector(...(stateList.map((state) => state.get()) as any));

		super(getStateData());

		stateList.forEach((state) => {
			this.unsubscribeList.push(
				state.subscribe(() => super.set(getStateData()))
			);
		});
	}

	set(_newState: Data): never {
		return throwComputedStateError();
	}

	reset(): never {
		return throwComputedStateError();
	}

	release(): void {
		this.unsubscribeList.forEach((unsubscribe) => unsubscribe());
		super.release();
	}
}

export { ComputedState };
