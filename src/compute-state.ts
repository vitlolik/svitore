import { State } from "./state";

class ComputeStateError extends Error {
	constructor() {
		super("ComputeState is read-only, you must not change it");
		this.name = "ComputeStateError";
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
	constructor(...args: [...StateList, Selector<StateList, Data>]) {
		const selector = args.pop() as Selector<StateList, Data>;
		const stateList = args as unknown as StateList;

		const getStateData = (): Data =>
			selector(...(stateList.map((state) => state.get()) as any));

		super(getStateData());

		stateList.forEach((state) => {
			state.subscribe(() => {
				super.set(getStateData());
			});
		});
	}

	set(newState: Data): void {
		throw new ComputeStateError();
	}

	change(getNewState: (prevState: Data) => Data): void {
		throw new ComputeStateError();
	}

	reset(): void {
		throw new ComputeStateError();
	}
}

export { ComputeState };
