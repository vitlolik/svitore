import { describe, it, expect, vi } from "vitest";
import { Effect } from "../effect";
import { allEffectsFinished } from "./all-effects-finished";

describe("allEffectsFinished", () => {
	it("should wait pending effect", async () => {
		const effect = new Effect(() => Promise.resolve());
		const testSubscribe = vi.fn();
		effect.subscribe((data) => {
			if (data.status === "finished") {
				testSubscribe();
			}
		});
		effect.run();

		await allEffectsFinished();

		expect(testSubscribe).toHaveBeenCalled();
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

		const testSubscribe1 = vi.fn();
		effect1.subscribe((data) => {
			if (data.status === "resolved") {
				effect2.run();
			} else if (data.status === "finished") {
				testSubscribe1();
			}
		});

		const testSubscribe2 = vi.fn();
		effect2.subscribe((data) => {
			if (data.status === "resolved") {
				effect3.run();
			} else if (data.status === "finished") {
				testSubscribe2();
			}
		});

		const testSubscribe3 = vi.fn();
		effect3.subscribe((data) => {
			if (data.status === "finished") {
				testSubscribe3();
			}
		});

		effect1.run();

		await allEffectsFinished();

		expect(testSubscribe1).toHaveBeenCalled();
		expect(testSubscribe2).toHaveBeenCalled();
		expect(testSubscribe3).toHaveBeenCalled();
	});
});
