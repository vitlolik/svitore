import { Event } from "../event";

const throttle = <T>(event: Event<T>, timeout: number) => {
	const throttleEvent = new Event<T>();
	event.channel({ target: throttleEvent });
	const throttleDispatch = throttleEvent.fire.bind(throttleEvent);

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

	throttleEvent.fire = fire;

	return throttleEvent;
};

export { throttle };
