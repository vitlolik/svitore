import { SelectorCallback } from "./types";
import { AbstractState } from "./services";

class ComputedState<
	States extends ReadonlyArray<AbstractState<any>>,
	T
> extends AbstractState<T> {
	private isChanged = false;
	private getComputed: () => T;
	private unsubscribes: (() => void)[] = [];

	constructor(states: States, selector: SelectorCallback<States, T>) {
		const getComputed = (): T =>
			selector(...(states.map((state) => state.get()) as any));

		super(getComputed());
		this.getComputed = getComputed;

		const subscriber = (): void => {
			if (this.subscribers.size) {
				return this.notify(getComputed());
			}

			this.isChanged = true;
		};

		this.unsubscribes = states.map((state) => state.subscribe(subscriber));
	}

	override get(): T {
		if (this.isChanged) {
			this.isChanged = false;
			this.notify(this.getComputed());
		}

		return super.get();
	}

	override release(): void {
		for (const unsubscribe of this.unsubscribes) {
			unsubscribe();
		}

		super.release();
	}
}

export { ComputedState };
