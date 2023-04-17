import { State } from "./state";
import { createBatchFunction } from "./shared";

class PersistState<Data> extends State<Data> {
	constructor(
		state: Data,
		private storageKey: string,
		private storage: Storage = window.localStorage
	) {
		super(state);
		const writeToStorage = createBatchFunction((newState: Data) => {
			storage.setItem(
				storageKey,
				typeof newState === "string" ? newState : JSON.stringify(newState)
			);
		});

		this.subscribe(writeToStorage);
		const valueFromStorage = storage.getItem(storageKey);

		if (valueFromStorage === null) return this;

		try {
			this.set(JSON.parse(valueFromStorage));
		} catch (error) {
			this.set(valueFromStorage as Data);
		}
	}

	release() {
		this.storage.removeItem(this.storageKey);
		super.release();
	}
}

export { PersistState };
