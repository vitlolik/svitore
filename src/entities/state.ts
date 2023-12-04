import { Event } from "./event";
import { AbstractState } from "./services";

class State<Data> extends AbstractState<Data> {
	private defaultState: Data;

	constructor(state: Data) {
		super(state);
		this.defaultState = state;
	}

	changeOn<Payload extends Data>(event: Event<Payload>): this;
	changeOn<Payload>(
		event: Event<Payload>,
		selector: (payload: Payload, state: Data, prevState: Data) => Data
	): this;
	changeOn(
		event: Event<any>,
		selector?: (payload: any, state: Data, prevState: Data) => Data
	): this {
		return this.trigger(event, (payload) => {
			this.notify(
				selector ? selector(payload, this.get(), this.getPrev()) : payload
			);
		});
	}

	resetOn(event: Event<any>): this {
		return this.changeOn(event, () => this.defaultState);
	}
}

export { State };
