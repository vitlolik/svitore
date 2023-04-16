import { Event } from "../event";

const debounceEvent = <T>(timeout: number) => {
	const event = new Event<T>();

	const debounceDispatch = event.dispatch;
	let timeoutId: NodeJS.Timeout;

	event.dispatch = (params: T): void => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => debounceDispatch(params), timeout);
	};

	return event;
};

export { debounceEvent };
