import { SelectorCallback, SvitoreError } from "./shared";
import { State } from "./state";

const throwComputeStateError = (): never => {
	throw new SvitoreError("ComputeState is read-only, you must not change it");
};

class ComputeState<
	StateList extends ReadonlyArray<State<any>>,
	Data
> extends State<Data> {
	private stateList: StateList;
	private selector: SelectorCallback<StateList, Data>;
	private unsubscribeList: (() => void)[] = [];

	constructor(...args: [...StateList, SelectorCallback<StateList, Data>]) {
		const selector = args.pop() as SelectorCallback<StateList, Data>;
		const stateList = args as unknown as StateList;

		const getStateData = (): Data =>
			selector(...(stateList.map((state) => state.get()) as any));

		super(getStateData());
		this.selector = selector;
		this.stateList = stateList;

		stateList.forEach((state) => {
			this.unsubscribeList.push(
				state.subscribe(() => super.set(getStateData()))
			);
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	set(newState: Data): void {
		throwComputeStateError();
	}

	reset(): void {
		throwComputeStateError();
	}

	clone(stateList = this.stateList): ComputeState<StateList, Data> {
		return new ComputeState(...[...stateList, this.selector]);
	}

	release(): void {
		this.unsubscribeList.forEach((unsubscribe) => unsubscribe());
		super.release();
	}
}

export { ComputeState };
