import { Entity } from "./shared/entity";

class State<TState> extends Entity<TState> {
	protected defaultState: TState;
	private prevState: TState;

	constructor(protected state: TState) {
		super();
		this.defaultState = state;
		this.prevState = state;
	}

	set = (newState: TState): void => {
		if (this.state === newState) return;

		this.prevState = this.state;
		this.state = newState;

		this.notify(this.state);
	};

	change = (getNewState: (prevState: TState) => TState) => {
		this.set(getNewState(this.get()));
	};

	reset = (): void => {
		this.set(this.defaultState);
	};

	get = (): TState => {
		return this.state;
	};

	getPrev = (): TState => {
		return this.prevState;
	};
}

export { State };
