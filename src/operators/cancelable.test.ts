import { describe, it, expect, vi } from "vitest";
import { Effect } from "../effect";
import { cancelable } from "./cancelable";

describe("cancelable", () => {
	const mock = () => {
		const abortControllerListener = vi.fn();
		const effect = new Effect((_params, abortController) => {
			abortController.signal.addEventListener("abort", abortControllerListener);
			return Promise.resolve();
		});
		const cancelableEffect = cancelable(effect);

		return { cancelableEffect, abortControllerListener };
	};
	it("example 1", () => {
		const { cancelableEffect, abortControllerListener } = mock();

		cancelableEffect.run();
		cancelableEffect.run();

		expect(abortControllerListener).toHaveBeenCalledTimes(1);
	});

	it("example 2", () => {
		const { cancelableEffect, abortControllerListener } = mock();

		cancelableEffect.run();
		cancelableEffect.run();
		cancelableEffect.run();

		expect(abortControllerListener).toHaveBeenCalledTimes(2);
	});

	it("example 3", () => {
		const { cancelableEffect, abortControllerListener } = mock();

		cancelableEffect.run();
		cancelableEffect.run();
		cancelableEffect.run();
		cancelableEffect.run();
		cancelableEffect.run();
		cancelableEffect.run();

		expect(abortControllerListener).toHaveBeenCalledTimes(5);
	});

	it("should throw error", async () => {
		const effect = new Effect(() => Promise.reject("TEST"));

		const cancelableEffect = cancelable(effect);

		try {
			await cancelableEffect.run();
		} catch (error) {
			expect(error).toBe("TEST");
		}
	});
});
