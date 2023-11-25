import { Event } from "./event";
import { AbstractState } from "./services";

class State<Data> extends AbstractState<Data> {
	constructor(protected state: Data) {
		super(state);
	}

	changeOn<Payload extends Data>(event: Event<Payload>): this;
	changeOn<Payload>(
		event: Event<Payload>,
		selector: (payload: Payload, state: Data) => Data
	): this;
	changeOn(
		event: Event<any>,
		selector?: (payload: any, state: Data) => Data
	): this {
		return this.trigger(event, (payload) => {
			this.notify(selector ? selector(payload, this.state) : payload);
		});
	}

	resetOn(event: Event<any>): this {
		return this.changeOn(event, () => this.defaultState);
	}
}

export { State };
