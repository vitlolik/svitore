import { Event } from "../event";

const throttleEvent = <T>(event: Event<T>, timeout: number) => {
	const throttleEvent = new Event<T>();
	event.subscribe(throttleEvent.dispatch);
	const throttleDispatch = throttleEvent.dispatch.bind(throttleEvent);

	let isThrottled = false;
	let savedParams: T | null;

	const fire = (params: T): void => {
		if (isThrottled) {
			savedParams = params;
			return;
		}

		throttleDispatch(params);
		isThrottled = true;

		setTimeout(() => {
			isThrottled = false;
			if (savedParams) {
				fire(savedParams);
				savedParams = null;
			}
		}, timeout);
	};

	throttleEvent.dispatch = fire;

	return throttleEvent;
};

export { throttleEvent };
