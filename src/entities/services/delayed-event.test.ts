import { describe, expect, test, vi } from "vitest";
import { DelayedEvent } from "./delayed-event";

describe("DelayedEvent", () => {
	class TestDelayedEvent extends DelayedEvent {
		override clearTimer(): void {
			super.clearTimer();
		}
	}

	test("should clear timeout", () => {
		const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
		const event = new TestDelayedEvent(0);

		event.clearTimer();

		expect(clearTimeoutSpy).toHaveBeenCalledOnce();
		vi.clearAllMocks();
	});

	test("should release and clear timer", () => {
		const subscriber = vi.fn();
		const event = new TestDelayedEvent(0);
		event.subscribe(subscriber);

		const clearTimerMock = vi.fn();
		event.clearTimer = clearTimerMock;

		event.release();

		event.dispatch();
		event.dispatch();
		event.dispatch();

		expect(clearTimerMock).toHaveBeenCalledOnce();
		expect(subscriber).not.toHaveBeenCalled();
	});
});
