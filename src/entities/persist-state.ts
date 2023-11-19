import { PACKAGE_LABEL } from "../constants";
import { createBatchFunction, logError } from "../utils";
import { State } from "./state";

const PERSIST_STORAGE_KEY = `${PACKAGE_LABEL}-persist-data` as const;

class PersistState<Data> extends State<Data> {
	constructor(
		state: Data,
		storageKey: string,
		private readonly storage: Storage = globalThis.localStorage
	) {
		super(state);

		const getPersistData = (): Record<string, Data> => {
			try {
				return JSON.parse(storage.getItem(PERSIST_STORAGE_KEY)!) ?? {};
			} catch (error) {
				logError("PersistState", "Invalid storage value", error);
				return {};
			}
		};

		const writeToStorage = createBatchFunction((newState: Data) => {
			storage.setItem(
				PERSIST_STORAGE_KEY,
				JSON.stringify({ ...getPersistData(), [storageKey]: newState })
			);
		});

		const stateFromStorage = getPersistData()[storageKey];

		if (stateFromStorage === undefined) {
			this.subscribe(writeToStorage);
			return this;
		}

		this.set(stateFromStorage);
		this.subscribe(writeToStorage);
	}

	clearStorage(): void {
		this.storage.removeItem(PERSIST_STORAGE_KEY);
	}
}

export { PersistState, PERSIST_STORAGE_KEY };
