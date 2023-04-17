import { describe, it, expect } from "vitest";
import { Effect } from "../effect";
import { allEffectsFinished } from "./all-effects-finished";

describe("allEffectsFinished", () => {
	it("should wait pending effect", async () => {
		const effect = new Effect(() => Promise.resolve());
		effect.run();

		await allEffectsFinished();

		expect(effect.onFinish.calls).toBe(1);
	});

	it("should wait all pending effects", async () => {
		const effect1 = new Effect(
			() => new Promise((resolve) => setTimeout(resolve, 3))
		);
		const effect2 = new Effect(
			() => new Promise((resolve) => setTimeout(resolve, 2))
		);
		const effect3 = new Effect(
			() => new Promise((resolve) => setTimeout(resolve, 1))
		);

		effect1.run();
		effect1.onResolve.listen(() => effect2.run());
		effect2.onResolve.listen(() => effect3.run());

		await allEffectsFinished();

		expect(effect1.onFinish.calls).toBe(1);
		expect(effect2.onFinish.calls).toBe(1);
		expect(effect3.onFinish.calls).toBe(1);
	});
});
