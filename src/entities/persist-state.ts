import { PACKAGE_LABEL } from "../constants";
import { createBatchFunction, SvitoreError } from "../utils";
import { State } from "./state";

const STORAGE_KEY_PREFIX = `${PACKAGE_LABEL}-` as const;
const NESTED_KEY = "_" as const;

class PersistState<Data> extends State<Data> {
	constructor(
		state: Data,
		private readonly storageKey: string,
		private readonly storage: Storage = localStorage
	) {
		super(state);
		this.storageKey = `${STORAGE_KEY_PREFIX}${storageKey}`;

		const writeToStorage = createBatchFunction((newState: Data) => {
			storage.setItem(
				this.storageKey,
				JSON.stringify({ [NESTED_KEY]: newState })
			);
		});

		const valueFromStorage = storage.getItem(this.storageKey);

		if (valueFromStorage === null) {
			this.subscribe(writeToStorage);
			return this;
		}

		try {
			const value = JSON.parse(valueFromStorage)[NESTED_KEY];
			this.set(value);
			this.subscribe(writeToStorage);
		} catch (error) {
			throw new SvitoreError("Invalid storage value");
		}
	}

	clearStorage(): void {
		this.storage.removeItem(this.storageKey);
	}
}

export { PersistState };
