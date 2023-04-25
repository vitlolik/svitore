import { SvitoreError } from "./shared";
import { State } from "./state";

class ComputeStateError extends SvitoreError {
	constructor(message?: string) {
		super(message ?? "ComputeState is read-only, you must not change it");
	}
}

type ExtractStateType<T extends ReadonlyArray<State<any>>> = {
	[K in keyof T]: T[K] extends State<infer U> ? U : never;
};

type Selector<StateList extends ReadonlyArray<State<any>>, Data> = (
	...args: ExtractStateType<StateList>
) => Data;

class ComputeState<
	StateList extends ReadonlyArray<State<any>>,
	Data
> extends State<Data> {
	private stateList: StateList;
	private selector: Selector<StateList, Data>;
	private unsubscribeList: (() => void)[] = [];

	constructor(...args: [...StateList, Selector<StateList, Data>]) {
		const selector = args.pop() as Selector<StateList, Data>;
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
		throw new ComputeStateError();
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	change(getNewState: (prevState: Data) => Data): void {
		throw new ComputeStateError();
	}

	reset(): void {
		throw new ComputeStateError();
	}

	clone(stateList = this.stateList): ComputeState<StateList, Data> {
		return new ComputeState(...[...stateList, this.selector]);
	}

	release(): void {
		this.unsubscribeList.forEach((unsubscribe) => unsubscribe());
		super.release();
	}
}

export { ComputeState, ComputeStateError };
