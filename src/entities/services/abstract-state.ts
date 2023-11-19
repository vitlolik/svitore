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

	protected set(newState: T): void {
		if (this.state === newState) return;

		this.prevState = this.state;
		this.state = newState;

		this.notify(this.state);
	}
}

export { AbstractState };
