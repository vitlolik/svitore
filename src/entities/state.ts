import { Event } from "./event";
import { AbstractState } from "./services";

class State<Data> extends AbstractState<Data> {
	private eventUnsubscribeMap: Map<Event<any>, () => void> = new Map();

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
		if (this.eventUnsubscribeMap.has(event)) return this;

		const unsubscribe = event.subscribe((payload) => {
			this.set(selector ? selector(payload, this.state) : payload);
		});
		this.eventUnsubscribeMap.set(event, unsubscribe);

		return this;
	}

	resetOn(event: Event<any>): this {
		return this.changeOn(event, () => this.defaultState);
	}

	release(): void {
		for (const unsubscribe of this.eventUnsubscribeMap.values()) {
			unsubscribe();
		}

		this.eventUnsubscribeMap.clear();
		super.release();
	}
}

export { State };
