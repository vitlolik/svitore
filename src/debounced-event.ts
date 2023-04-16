import { Event, EventOptions } from "./event";

class DebouncedEvent<
	TPayload extends any = void,
	TMeta extends any = any
> extends Event<TPayload, TMeta> {
	private timeoutId: NodeJS.Timeout;

	constructor(
		private timeout: number,
		options?: EventOptions<TPayload, TMeta>
	) {
		super(options);
	}

	dispatch(payload: TPayload): void {
		clearTimeout(this.timeoutId);
		this.timeoutId = setTimeout(() => super.dispatch(payload), this.timeout);
	}
}

export { DebouncedEvent };
