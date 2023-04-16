import { State } from "../state";
import { DebouncedEvent } from "../debounced-event";

const persistState = <T>(
	state: State<T>,
	storageKey: string,
	storage: Storage = window.localStorage
): State<T> => {
	const changeEvent = new DebouncedEvent<T>(100);
	state.subscribe((newState) => changeEvent.dispatch(newState));
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
