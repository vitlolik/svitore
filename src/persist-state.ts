import { State } from "./state";
import { createBatchFunction } from "./shared";

const KEY_PREFIX = "@sv-";
const VALUE_KEY = "_";

class PersistState<Data> extends State<Data> {
	storageKey: string;
	constructor(
		state: Data,
		storageKey: string,
		private storage: Storage = window.localStorage
	) {
		super(state);
		this.storageKey = `${KEY_PREFIX}${storageKey}`;

		const writeToStorage = createBatchFunction((newState: Data) => {
			storage.setItem(
				this.storageKey,
				JSON.stringify({ [VALUE_KEY]: newState })
			);
		});

		this.subscribe(writeToStorage);
		const valueFromStorage = storage.getItem(this.storageKey);

		if (valueFromStorage === null) return this;

		try {
			const value = JSON.parse(valueFromStorage)[VALUE_KEY];
			this.set(value);
		} catch (error) {
			console.error(error);
		}
	}

	release() {
		this.storage.removeItem(this.storageKey);
		super.release();
	}
}

export { PersistState };
