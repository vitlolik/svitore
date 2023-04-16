import { State } from "../state";
import { Event } from "../event";
import { debounceEvent } from "./debounceEvent";

const persistState = <T>(
	state: State<T>,
	storageKey: string,
	storage: Storage = window.localStorage
): State<T> => {
	const changeEvent = debounceEvent(100);
	state.subscribe(changeEvent.dispatch);
	changeEvent.listen((newState) => {
		storage.setItem(
			storageKey,
			typeof newState === "string" ? newState : JSON.stringify(newState)
		);
	});
	const valueFromStorage = storage.getItem(storageKey);

	if (valueFromStorage === null) return state;

	try {
		state.set(JSON.parse(valueFromStorage));
	} catch (error) {
		state.set(valueFromStorage as T);
	}

	return state;
};

export { persistState };
