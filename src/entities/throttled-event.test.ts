import { describe, expect, test } from "vitest";
import { ThrottledEvent } from "./throttled-event";

describe("ThrottledEvent", () => {
	test("should set pending state", async () => {
		const event = new ThrottledEvent(300);

		expect(event.pending).toBe(false);

		event.dispatch();
		expect(event.pending).toBe(false);

		event.dispatch();
		event.dispatch();
		expect(event.pending).toBe(true);

		await new Promise((resolve) => event.subscribe(resolve));
		expect(event.pending).toBe(false);
	});
});
