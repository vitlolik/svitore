import { Entity } from "./services";

class State<Data> extends Entity<Data> {
	protected defaultState: Data;
	private prevState: Data;

	constructor(protected state: Data) {
		super();
		this.defaultState = state;
		this.prevState = state;
	}

	set(newState: Data): void {
		if (this.state === newState) return;

		this.prevState = this.state;
		this.state = newState;

		this.notify(this.state);
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