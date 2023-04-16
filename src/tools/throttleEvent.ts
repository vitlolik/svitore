import { Event } from "../event";

const throttleEvent = <T>(timeout: number) => {
	const event = new Event<T>();
	const throttleDispatch = event.dispatch;

	let isThrottled = false;
	let savedParams: T | null;

	const throttledDispatch = (params: T): void => {
		if (isThrottled) {
			savedParams = params;
			return;
		}

		throttleDispatch(params);
		isThrottled = true;

		setTimeout(() => {
			isThrottled = false;
			if (savedParams) {
				throttledDispatch(savedParams);
				savedParams = null;
			}
		}, timeout);
	};

	event.dispatch = throttledDispatch;

	return event;
};

export { throttleEvent };
