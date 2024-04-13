import { AbstractState } from "./services";
import type { SelectorCallback } from "./types";

class ComputedState<
	States extends ReadonlyArray<AbstractState<any>>,
	T
> extends AbstractState<T> {
	private isInvalidated = false;
	private getComputed: () => T;
	private unsubscribes: (() => void)[] = [];

	constructor(states: States, selector: SelectorCallback<States, T>) {
		const getComputed = (): T =>
			selector(...(states.map((state) => state.get()) as any));

		super(getComputed());
		this.getComputed = getComputed;

		const subscriber = (): void => {
			if (this.subscribers.size) {
				this.notify(getComputed());
				return;
			}

			this.isInvalidated = true;
		};

		this.unsubscribes = states.map((state) => state.subscribe(subscriber));
	}

	override get(): T {
		if (this.isInvalidated) {
			this.isInvalidated = false;
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
