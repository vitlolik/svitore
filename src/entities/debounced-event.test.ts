import { afterEach, describe, expect, test, vi } from "vitest";
import { DebouncedEvent } from "./debounced-event";

describe("DebouncedEvent", () => {
	class TestDebouncedEvent<T = void> extends DebouncedEvent<T> {
		get timer(): number | NodeJS.Timeout {
			return this.timeoutId;
		}

		clearTimer = vi.fn();
	}

	class MockTimeout implements NodeJS.Timeout {
		constructor(private timerId: number) {}
		ref(): this {
			throw new Error("Method not implemented.");
		}
		unref(): this {
			throw new Error("Method not implemented.");
		}
		hasRef(): boolean {
			throw new Error("Method not implemented.");
		}
		refresh(): this {
			throw new Error("Method not implemented.");
		}
		[Symbol.dispose](): void {
			throw new Error("Method not implemented.");
		}
		[Symbol.toPrimitive](): number {
			return this.timerId;
		}
	}

	const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

	afterEach(() => {
		vi.clearAllMocks();
	});

	test("should clear timer", () => {
		const debouncedEvent = new TestDebouncedEvent(0);
		debouncedEvent.dispatch();

		expect(debouncedEvent.clearTimer).toHaveBeenCalledOnce();
	});

	test("should run setTimeout with timeout and set timer", () => {
		setTimeoutSpy.mockImplementationOnce(() => new MockTimeout(123));
		const debouncedEvent = new TestDebouncedEvent(10);
		debouncedEvent.dispatch();

		expect(setTimeoutSpy).toHaveBeenCalledOnce();
		expect(Number(debouncedEvent.timer)).toBe(123);
	});
});
