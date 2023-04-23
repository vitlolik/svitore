import { Entity } from "./shared";

class State<Data> extends Entity<Data> {
	protected defaultState: Data;
	private prevState: Data;

	constructor(protected state: Data) {
		super();
		this.defaultState = state;
		this.prevState = state;
	}

	clone(): State<Data> {
		return new State(this.defaultState);
	}

	set(newState: Data): void {
		if (this.state === newState) return;

		this.prevState = this.state;
		this.state = newState;

		this.notify(this.state);
	}

	change(getNewState: (prevState: Data) => Data): void {
		this.set(getNewState(this.get()));
	}

	reset(): void {
		this.set(this.defaultState);
	}

	get(): Data {
		return this.state;
	}

	getPrev(): Data {
		return this.prevState;
	}
}

export { State };
