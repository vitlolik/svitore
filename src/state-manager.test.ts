import { describe, it, expect, vi } from "vitest";
import { StateManager } from "./state-manager";

describe("svitore", () => {
	describe("allEffectsFinished", () => {
		it("should wait pending effect", async () => {
			const logic = StateManager.initModule("test allEffectsFinished");
			const effect = logic.initEffect(() => Promise.resolve());
			const testSubscribe = vi.fn();
			effect.subscribe(testSubscribe);
			effect.run();

			await StateManager.waitForEffects();

			expect(testSubscribe).toHaveBeenCalled();
		});

		it("should wait all pending effects", async () => {
			const logic = StateManager.initModule("test allEffectsFinished");

			const effect1 = logic.initEffect(
				() => new Promise((resolve) => setTimeout(resolve, 3))
			);
			const effect2 = logic.initEffect(
				() => new Promise((resolve) => setTimeout(resolve, 2))
			);
			const effect3 = logic.initEffect(
				() => new Promise((resolve) => setTimeout(resolve, 1))
			);

			const testSubscribe1 = vi.fn();
			effect1.subscribe(() => {
				effect2.run();
				testSubscribe1();
			});

			const testSubscribe2 = vi.fn();
			effect2.subscribe(() => {
				effect3.run();
				testSubscribe2();
			});

			const testSubscribe3 = vi.fn();
			effect3.subscribe(testSubscribe3);

			effect1.run();

			await StateManager.waitForEffects();

			expect(testSubscribe1).toHaveBeenCalled();
			expect(testSubscribe2).toHaveBeenCalled();
			expect(testSubscribe3).toHaveBeenCalled();
		});
	});
});
