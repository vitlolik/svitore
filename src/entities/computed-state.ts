import { SelectorCallback } from "./types";
import { AbstractState } from "./services";
class ComputedState<
	States extends ReadonlyArray<AbstractState<any>>,
	T
> extends AbstractState<T> {
	private unsubscribes: (() => void)[] = [];

	constructor(states: States, selector: SelectorCallback<States, T>) {
		const getState = (): T =>
			selector(...(states.map((state) => state.get()) as any));

		super(getState());

		this.unsubscribes = states.map((state) =>
			state.subscribe(() => this.notify(getState()))
		);
	}

	override release(): void {
		for (const unsubscribe of this.unsubscribes) {
			unsubscribe();
		}

		super.release();
	}
}

export { ComputedState };
