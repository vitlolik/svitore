import { describe, expect, vi, test } from "vitest";
import { Svitore } from "./svitore";
import { SvitoreModule } from "./svitore-module";

describe("Svitore", () => {
	describe("Module - create svitore module", () => {
		test("should create svitore module and add it to list", () => {
			const testModule1 = Svitore.Module("test1");
			const testModule2 = Svitore.Module("test2");

			expect(Svitore.modules).toHaveLength(2);
			expect(testModule1).instanceOf(SvitoreModule);
			expect(testModule2).instanceOf(SvitoreModule);
		});
	});

	describe("allSettled - waiting until all async operations to complete", () => {
		test("should wait for pending effect", async () => {
			const testModule = Svitore.Module("test");
			const effect = testModule.Effect(() => Promise.resolve());
			const testSubscribe = vi.fn();
			effect.subscribe(testSubscribe);
			effect.run();

			await Svitore.allSettled();

			expect(testSubscribe).toHaveBeenCalled();
		});

		test("should wait for pending effects", async () => {
			const testModule = Svitore.Module("test");

			const effect1 = testModule.Effect(
				() => new Promise((resolve) => setTimeout(resolve, 3))
			);
			const effect2 = testModule.Effect(
				() => new Promise((resolve) => setTimeout(resolve, 2))
			);
			const effect3 = testModule.Effect(
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

			await Svitore.allSettled();

			expect(testSubscribe1).toHaveBeenCalled();
			expect(testSubscribe2).toHaveBeenCalled();
			expect(testSubscribe3).toHaveBeenCalled();
		});

		test("should wait for effect runners", async () => {
			const testModule = Svitore.Module("test");

			const effect = testModule.Effect(() => Promise.resolve("test"));
			const effectRunnerSubscriber = vi.fn();
			const effectRunner = testModule.EffectRunner(effect, {
				delay: () => 10,
				while: ({ fulfilled }) => fulfilled <= 3,
			});
			effectRunner.subscribe(effectRunnerSubscriber);

			effectRunner.start();

			await Svitore.allSettled();

			expect(effectRunnerSubscriber).toHaveBeenCalledOnce();
		});

		test("should wait for delayed events", async () => {
			const testModule = Svitore.Module("test");
			const testState = testModule.State("");

			const debouncedEvent = testModule.DebouncedEvent<string>(300);
			const throttledEvent = testModule.ThrottledEvent<string>(400);

			testState.changeOn(debouncedEvent).changeOn(throttledEvent);

			debouncedEvent.dispatch("debounce");
			throttledEvent.dispatch("");
			throttledEvent.dispatch("throttle");

			await Svitore.allSettled();

			expect(testState.get()).toBe("throttle");
		});
	});

	describe("reset - reset state for each module. In other words, resets the state of the entire application", () => {
		test("should call reset for each module", () => {
			const testModule1 = Svitore.Module("test1");
			const testModule2 = Svitore.Module("test2");
			const testModule3 = Svitore.Module("test3");
			testModule1.reset = vi.fn();
			testModule2.reset = vi.fn();
			testModule3.reset = vi.fn();

			Svitore.reset();

			expect(testModule1.reset).toHaveBeenCalledOnce();
			expect(testModule2.reset).toHaveBeenCalledOnce();
			expect(testModule3.reset).toHaveBeenCalledOnce();
		});
	});

	describe("release - clears subscriptions for each module. In other words, clears subscriptions of the entire application", () => {
		test("should call resetState for each module", () => {
			const testModule1 = Svitore.Module("test1");
			const testModule2 = Svitore.Module("test2");
			const testModule3 = Svitore.Module("test3");
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
