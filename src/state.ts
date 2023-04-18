import { Entity, Observer } from "./shared";

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

	subscribe(subscriber: Observer<Data>): () => void {
		return this.observe(subscriber);
	}
}

export { State };
