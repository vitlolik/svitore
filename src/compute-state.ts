import { logError } from "./shared";
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
	private unsubscribeList: (() => void)[] = [];

	constructor(...args: [...StateList, Selector<StateList, Data>]) {
		const selector = args.pop() as Selector<StateList, Data>;
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

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	set(newState: Data): void {
		logError(new ComputeStateError());
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	change(getNewState: (prevState: Data) => Data): void {
		logError(new ComputeStateError());
	}

	reset(): void {
		logError(new ComputeStateError());
	}

	release(): void {
		this.unsubscribeList.forEach((unsubscribe) => unsubscribe());
		super.release();
	}
}

export { ComputeState };
