import { afterEach, describe, expect, test, vi } from "vitest";
import { SvitoreModule } from "./svitore-module";
import { allSettled, release, reset } from "./tools";

afterEach(release);

describe("tools", () => {
	test("reset - should call reset for each module", () => {
		const testModule1 = new SvitoreModule("test1");
		const testModule2 = new SvitoreModule("test2");
		const testModule3 = new SvitoreModule("test3");
		testModule1.reset = vi.fn();
		testModule2.reset = vi.fn();
		testModule3.reset = vi.fn();

		reset();

		expect(testModule1.reset).toHaveBeenCalledOnce();
		expect(testModule2.reset).toHaveBeenCalledOnce();
		expect(testModule3.reset).toHaveBeenCalledOnce();
	});

	test("release - should call release for each module", () => {
		const testModule1 = new SvitoreModule("test1");
		const testModule2 = new SvitoreModule("test2");
		const testModule3 = new SvitoreModule("test3");
		const spyRelease1 = vi.spyOn(testModule1, "release");
		const spyRelease2 = vi.spyOn(testModule2, "release");
		const spyRelease3 = vi.spyOn(testModule3, "release");

		release();

		expect(spyRelease1).toHaveBeenCalledOnce();
		expect(spyRelease2).toHaveBeenCalledOnce();
		expect(spyRelease3).toHaveBeenCalledOnce();

		vi.clearAllMocks();
	});

	describe("allSettled", () => {
		test("should wait for pending effect", async () => {
			const testModule = new SvitoreModule("test");
			const effect = testModule.Effect(() => Promise.resolve());
			const testSubscribe = vi.fn();
			effect.subscribe(testSubscribe);
			effect.run();

			await allSettled();

			expect(testSubscribe).toHaveBeenCalled();
		});

		test("should wait for pending effects", async () => {
			const testModule = new SvitoreModule("test");

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

			await allSettled();

			expect(testSubscribe1).toHaveBeenCalled();
			expect(testSubscribe2).toHaveBeenCalled();
			expect(testSubscribe3).toHaveBeenCalled();
		});

		test("should wait for effect runners", async () => {
			const testModule = new SvitoreModule("test");

			const effect = testModule.Effect(() => Promise.resolve("test"));
			const effectRunnerSubscriber = vi.fn();
			const effectRunner = testModule.EffectRunner(effect, {
				delay: () => 10,
				until: ({ fulfilled }) => fulfilled <= 3,
			});
			effectRunner.subscribe(effectRunnerSubscriber);

			effectRunner.start();

			await allSettled();

			expect(effectRunnerSubscriber).toHaveBeenCalledOnce();
		});

		test("should wait for delayed events", async () => {
			const testModule = new SvitoreModule("test");
			const testState = testModule.State("");

			const debouncedEvent = testModule.DebouncedEvent<string>(300);
			const throttledEvent = testModule.ThrottledEvent<string>(400);

			testState.changeOn(debouncedEvent).changeOn(throttledEvent);

			debouncedEvent.dispatch("debounce");
			throttledEvent.dispatch("");
			throttledEvent.dispatch("throttle");

			await allSettled();

			expect(testState.get()).toBe("throttle");
		});
	});
});
