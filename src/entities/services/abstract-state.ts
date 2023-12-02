import { Entity } from "./entity";

abstract class AbstractState<T> extends Entity<T> {
	private prevState: T;

	constructor(private state: T) {
		super();
		this.prevState = state;
	}

	get(): T {
		return this.state;
	}

	getPrev(): T {
		return this.prevState;
	}

	protected notify(newState: T): void {
		if (this.state === newState) return;

		this.prevState = this.state;
		this.state = newState;

		super.notify(this.state);
	}
}

export { AbstractState };
