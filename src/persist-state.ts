import { State } from "./state";
import { createBatchFunction, logError, LOG_PREFIX } from "./shared";

const STORAGE_KEY_PREFIX = `${LOG_PREFIX}-` as const;
const NESTED_KEY = "_" as const;

class PersistStateError extends Error {
	constructor() {
		super("Invalid storage value");
		this.name = "PersistStateError";
	}
}

class PersistState<Data> extends State<Data> {
	constructor(
		state: Data,
		private storageKey: string,
		private readonly storage: Storage = window.localStorage
	) {
		super(state);
		this.storageKey = `${STORAGE_KEY_PREFIX}${storageKey}`;

		const writeToStorage = createBatchFunction((newState: Data) => {
			storage.setItem(
				this.storageKey,
				JSON.stringify({ [NESTED_KEY]: newState })
			);
		});

		this.subscribe(writeToStorage);
		const valueFromStorage = storage.getItem(this.storageKey);

		if (valueFromStorage === null) return this;

		try {
			const value = JSON.parse(valueFromStorage)[NESTED_KEY];
			this.set(value);
		} catch (error) {
			logError(new PersistStateError());
		}
	}

	clone(
		storageKey = this.storageKey,
		storage = this.storage
	): PersistState<Data> {
		return new PersistState(this.defaultState, storageKey, storage);
	}

	release(): void {
		this.storage.removeItem(this.storageKey);
		super.release();
	}
}

export { PersistState };
