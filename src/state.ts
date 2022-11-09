import { Event } from "./event";
import { Entity } from "./shared/entity";

class State<TState> extends Entity<TState> {
	protected defaultState: TState;
	private prevState: TState;

	constructor(protected state: TState) {
		super();
		this.defaultState = state;
		this.prevState = state;
	}

	private set(newState: TState): void {
		if (this.state === newState) return;

		this.prevState = this.state;
		this.state = newState;

		this.notify(this.state);
	}

	inform(state: TState): void {
		this.set(state);
	}

	on<TPayload extends TState>(event: Event<TPayload>): State<TState>;

	on<TPayload extends any>(
		event: Event<TPayload>,
		getNewState: (payload: TPayload, state: TState) => TState
	): State<TState>;

	on(
		event: Event<any>,
		getNewState?: (payload: any, state: TState) => TState
	): State<TState> {
		event.channel({
			target: this,
			map: (payload: any) => getNewState?.(payload, this.state) ?? payload,
		});

		return this;
	}

	onReset(event: Event<any>): State<TState> {
		return this.on(event, () => this.defaultState);
	}

	map<TResult extends any>(
		selector: (state: TState) => TResult
	): State<TResult> {
		const newState = new State(selector(this.get()));

		this.channel({ target: newState, map: selector });

		return newState;
	}

	get(): TState {
		return this.state;
	}

	getPrev(): TState {
		return this.prevState;
	}
}

export { State };
