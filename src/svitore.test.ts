import { describe, it, expect, vi } from "vitest";
import { Svitore } from "./svitore";
import { SvitoreModule } from "./svitore-module";

describe("Svitore", () => {
	describe("createModule - create svitore module", () => {
		it("should create svitore module and add it to list", () => {
			const testModule1 = Svitore.createModule("test1");
			const testModule2 = Svitore.createModule("test2");

			expect(Svitore.modules).toHaveLength(2);
			expect(testModule1).instanceOf(SvitoreModule);
			expect(testModule2).instanceOf(SvitoreModule);
		});
	});

	describe("waitForEffects - waiting until all async effects to complete", () => {
		it("should wait pending effect", async () => {
			const testModule = Svitore.createModule("test");
			const effect = testModule.createEffect(() => Promise.resolve());
			const testSubscribe = vi.fn();
			effect.subscribe(testSubscribe);
			effect.run();

			await Svitore.waitForEffects();

			expect(testSubscribe).toHaveBeenCalled();
		});

		it("should wait all pending effects", async () => {
			const testModule = Svitore.createModule("test");

			const effect1 = testModule.createEffect(
				() => new Promise((resolve) => setTimeout(resolve, 3))
			);
			const effect2 = testModule.createEffect(
				() => new Promise((resolve) => setTimeout(resolve, 2))
			);
			const effect3 = testModule.createEffect(
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

			await Svitore.waitForEffects();

			expect(testSubscribe1).toHaveBeenCalled();
			expect(testSubscribe2).toHaveBeenCalled();
			expect(testSubscribe3).toHaveBeenCalled();
		});
	});

	describe("resetState - reset state for each module. In other words, resets the state of the entire application", () => {
		it("should call resetState for each module", () => {
			const testModule1 = Svitore.createModule("test1");
			const testModule2 = Svitore.createModule("test2");
			const testModule3 = Svitore.createModule("test3");
			testModule1.resetState = vi.fn();
			testModule2.resetState = vi.fn();
			testModule3.resetState = vi.fn();

			Svitore.resetState();

			expect(testModule1.resetState).toHaveBeenCalledOnce();
			expect(testModule2.resetState).toHaveBeenCalledOnce();
			expect(testModule3.resetState).toHaveBeenCalledOnce();
		});
	});

	describe("release - clears subscriptions for each module. In other words, clears subscriptions of the entire application", () => {
		it("should call resetState for each module", () => {
			const testModule1 = Svitore.createModule("test1");
			const testModule2 = Svitore.createModule("test2");
			const testModule3 = Svitore.createModule("test3");
			testModule1.release = vi.fn();
			testModule2.release = vi.fn();
			testModule3.release = vi.fn();

			Svitore.release();

			expect(testModule1.release).toHaveBeenCalledOnce();
			expect(testModule2.release).toHaveBeenCalledOnce();
			expect(testModule3.release).toHaveBeenCalledOnce();
		});
	});
});
