import { vi, test, expect, describe, afterEach } from "vitest";

import { PERSIST_STORAGE_KEY, PersistState } from "./persist-state";
import { State } from "./state";
import { Event } from "./event";

describe("persist state", () => {
	const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
	const removeItemSpy = vi.spyOn(Storage.prototype, "removeItem");
	const consoleErrorSpy = vi
		.spyOn(console, "error")
		.mockImplementation(() => {});

	afterEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
	});

	test("type", () => {
		const persistState = new PersistState("test state", "test-key");

		expect(persistState).instanceOf(State);
	});

	test("should init state", () => {
		const persistState = new PersistState("test state", "test-key");

		expect(persistState.get()).toBe("test state");
	});

	test("should set state from storage if storage has value", async () => {
		localStorage.setItem(
			PERSIST_STORAGE_KEY,
			JSON.stringify({ "test-key": "value in storage" }),
		);

		const persistState = new PersistState("test state", "test-key");

		expect(getItemSpy).toHaveBeenCalledTimes(1);
		expect(getItemSpy).toHaveBeenCalledWith(PERSIST_STORAGE_KEY);
		expect(persistState.get()).toBe("value in storage");
	});

	test("should subscribe to state and update storage", async () => {
		localStorage.setItem(
			PERSIST_STORAGE_KEY,
			JSON.stringify({ "test-key": "value in storage" }),
		);
		const event = new Event<string>();
		new PersistState("test state", "test-key").changeOn(event);

		event.dispatch("new test value");

		// because storage updated as microtask
		await Promise.resolve();

		expect(localStorage.getItem(PERSIST_STORAGE_KEY)).toBe(
			`{"test-key":"new test value"}`,
		);
	});

	test("clear - should remove item from storage", () => {
		const persistState = new PersistState("test state", "test-key");

		persistState.clear();

		expect(removeItemSpy).toHaveBeenCalledTimes(1);
		expect(removeItemSpy).toHaveBeenCalledWith(PERSIST_STORAGE_KEY);
	});

	test("should log error if value invalid in storage", () => {
		localStorage.setItem(PERSIST_STORAGE_KEY, "");

		new PersistState("test state", "test-key");

		expect(consoleErrorSpy).toHaveBeenCalledOnce();
	});
});
