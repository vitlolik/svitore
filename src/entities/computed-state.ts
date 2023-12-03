import { SelectorCallback } from "../types";
import { AbstractState } from "./services";

class ComputedState<
	States extends ReadonlyArray<AbstractState<any>>,
	T
> extends AbstractState<T> {
	private unsubscribes: (() => void)[] = [];

	constructor(...args: [...States, SelectorCallback<States, T>]) {
		const selector = args.pop() as SelectorCallback<States, T>;
		const states = args as unknown as States;

		const getStateData = (): T =>
			selector(...(states.map((state) => state.get()) as any));

		super(getStateData());

		this.unsubscribes = states.map((state) =>
			state.subscribe(() => this.notify(getStateData()))
		);
	}

	release(): void {
		for (const unsubscribe of this.unsubscribes) {
			unsubscribe();
		}

		super.release();
	}
}

export { ComputedState };
