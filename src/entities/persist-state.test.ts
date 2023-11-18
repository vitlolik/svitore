import { vi, it, expect, describe } from "vitest";

import { PERSIST_STORAGE_KEY, PersistState } from "./persist-state";
import { State } from "./state";
import { SvitoreError } from "../utils";

class MockStorage implements Storage {
	length: number;
	clear = vi.fn();
	getItem = vi.fn<[string], string | null>(() => null);
	key = vi.fn();
	removeItem = vi.fn();
	setItem = vi.fn<[string]>();
}

describe("persist state", () => {
	it("type", () => {
		const persistState = new PersistState(
			"test state",
			"test-key",
			new MockStorage()
		);

		expect(persistState).instanceOf(State);
	});

	it("should init state", () => {
		const persistState = new PersistState(
			"test state",
			"test-key",
			new MockStorage()
		);

		expect(persistState.get()).toBe("test state");
	});

	it("should set state from storage if storage has value", async () => {
		const storage = new MockStorage();

		storage.getItem = vi.fn((_key: string) =>
			JSON.stringify({ "test-key": "value in storage" })
		);
		const persistState = new PersistState("test state", "test-key", storage);

		// because storage updated as microtask
		// await Promise.resolve();

		expect(storage.getItem).toHaveBeenCalledTimes(1);
		expect(storage.getItem).toHaveBeenCalledWith(PERSIST_STORAGE_KEY);
		expect(persistState.get()).toBe("value in storage");
	});

	it("should subscribe to state and update storage", async () => {
		const storage = new MockStorage();
		storage.getItem = vi.fn((_key: string) =>
			JSON.stringify({ "test-key": "value in storage" })
		);
		const persistState = new PersistState("test state", "test-key", storage);

		persistState.set("new test value");

		// because storage updated as microtask
		await Promise.resolve();

		expect(storage.setItem).toHaveBeenCalledTimes(1);
		expect(storage.setItem).toHaveBeenCalledWith(
			PERSIST_STORAGE_KEY,
			JSON.stringify({ "test-key": "new test value" })
		);
	});

	it("clearStorage - should remove item from storage", () => {
		const storage = new MockStorage();
		const persistState = new PersistState("test state", "test-key", storage);

		persistState.clearStorage();

		expect(storage.removeItem).toHaveBeenCalledTimes(1);
		expect(storage.removeItem).toHaveBeenCalledWith(PERSIST_STORAGE_KEY);
	});

	it("should throw error if value invalid in storage", () => {
		const storage = new MockStorage();
		storage.getItem = vi.fn((_key: string) => "");

		try {
			new PersistState("test state", "test-key", storage);
		} catch (error) {
			expect(error).toBeInstanceOf(SvitoreError);
		}
	});
});
