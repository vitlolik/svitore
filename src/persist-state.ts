import { State } from "./state";
import { DebouncedEvent } from "./debounced-event";

class PersistState<TState> extends State<TState> {
	constructor(
		state: TState,
		private storageKey: string,
		private storage: Storage = window.localStorage
	) {
		super(state);

		const changeEvent = new DebouncedEvent<TState>(100);
		changeEvent.listen((newState) => {
			storage.setItem(
				storageKey,
				typeof newState === "string" ? newState : JSON.stringify(newState)
			);
		});
		this.subscribe((newState) => changeEvent.dispatch(newState));
		const valueFromStorage = storage.getItem(storageKey);

		if (valueFromStorage === null) return this;

		try {
			this.set(JSON.parse(valueFromStorage));
		} catch (error) {
			this.set(valueFromStorage as TState);
		}
	}

	release() {
		this.storage.removeItem(this.storageKey);
		super.release();
	}
}

export { PersistState };
