import { Event } from "../event";

const debounceEvent = <T>(event: Event<T>, timeout: number) => {
	const debounceEvent = new Event<T>();
	event.subscribe(debounceEvent.dispatch);

	const debounceDispatch = debounceEvent.dispatch.bind(debounceEvent);
	let timeoutId: NodeJS.Timeout;

	debounceEvent.dispatch = (params: T): void => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => debounceDispatch(params), timeout);
	};

	return debounceEvent;
};

export { debounceEvent };
