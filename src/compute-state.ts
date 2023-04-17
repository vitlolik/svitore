import { State } from "./state";

type ExtractStateType<T extends ReadonlyArray<State<any>>> = {
	[K in keyof T]: T[K] extends State<infer U> ? U : never;
};

class ComputeStateError extends Error {
	constructor() {
		super("ComputeState is read-only, you must not change it");
		this.name = "ComputeStateError";
	}
}

class ComputeState<
	StateList extends ReadonlyArray<State<any>>,
	StateType
> extends State<StateType> {
	constructor(
		stateList: [...StateList],
		selector: (...args: ExtractStateType<StateList>) => StateType
	) {
		const getStateData = () =>
			selector(
				...(stateList.map((state) =>
					state.get()
				) as ExtractStateType<StateList>)
			);

		super(getStateData());

		stateList.forEach((state) => {
			state.subscribe(() => {
				super.set(getStateData());
			});
		});
	}

	set(newState: StateType): void {
		throw new ComputeStateError();
	}

	change(getNewState: (prevState: StateType) => StateType): void {
		throw new ComputeStateError();
	}

	reset(): void {
		throw new ComputeStateError();
	}
}

export { ComputeState };
