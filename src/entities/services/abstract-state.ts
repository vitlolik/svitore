import { Entity } from "./entity";

abstract class AbstractState<T> extends Entity<T> {
	protected defaultState: T;
	protected prevState: T;

	constructor(protected state: T) {
		super();
		this.defaultState = state;
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
