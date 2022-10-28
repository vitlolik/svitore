import { Event } from "../event";

const debounce = <T>(event: Event<T>, timeout: number) => {
	const debounceEvent = new Event<T>();
	event.channel({ target: debounceEvent });

	const debounceDispatch = debounceEvent.fire.bind(debounceEvent);
	let timeoutId: NodeJS.Timeout;

	debounceEvent.fire = (params: T): void => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => debounceDispatch(params), timeout);
	};

	return debounceEvent;
};

export { debounce };
