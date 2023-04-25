import { describe, it, expect, vi } from "vitest";

import { Effect } from "./effect";
import { Entity } from "./shared/entity";

describe("effect", () => {
	it("type", () => {
		const effect = new Effect(() => Promise.resolve());

		expect(effect).instanceOf(Entity);
	});

	it("implement effect function", () => {
		const effectFunction = vi.fn(() => Promise.resolve());
		const newEffectFunction = vi.fn(() => Promise.resolve());
		const effect = new Effect(effectFunction);
		effect.implement(newEffectFunction);

		effect.run();

		expect(effectFunction).toHaveBeenCalledTimes(0);
		expect(newEffectFunction).toHaveBeenCalledTimes(1);
	});

	describe("run", () => {
		it("return promise", () => {
			const effect = new Effect(() => Promise.resolve());
			const runResult = effect.run();

			expect(runResult).instanceOf(Promise);
		});

		it("return void", async () => {
			const effect = new Effect(() => Promise.resolve("hello"));

			const result = await effect.run();

			expect(result).toBe(undefined);
		});
	});
});
