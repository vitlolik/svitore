import { describe, expect, test, vi } from "vitest";
import { EffectRunner } from "./effect-runner";
import { Effect } from "./effect";
import { Event } from "./event";

describe("EffectRunner", () => {
	describe("start", () => {
		test("should process successful rerun", async () => {
			const successfulSubscriber = vi.fn();
			const effect = new Effect(() => Promise.resolve("test"));
			effect.fulfilled.subscribe(successfulSubscriber);

			const effectRunner = new EffectRunner(effect, {
				delay: 0,
				successfulCount: 3,
			});

			effectRunner.start();

			await new Promise((resolve) => effectRunner.subscribe(resolve));

			expect(successfulSubscriber).toHaveBeenCalledTimes(3);
		});

		test("should process failure rerun", async () => {
			const failureSubscriber = vi.fn();
			const effect = new Effect(() => Promise.reject("test"));
			effect.rejected.subscribe(failureSubscriber);

			const effectRunner = new EffectRunner(effect, {
				delay: 0,
				failureCount: 5,
			});

			effectRunner.start();

			await new Promise((resolve) => effectRunner.subscribe(resolve));

			expect(failureSubscriber).toHaveBeenCalledTimes(5);
		});

		test("should process successful and failure rerun", async () => {
			const successfulSubscriber = vi.fn();
			const failureSubscriber = vi.fn();
			let testValue = 10;
			const effect = new Effect(() => {
				let promise: Promise<any>;

				if (testValue < 5) {
					promise = Promise.reject("test");
				} else {
					promise = Promise.resolve("test");
				}
				testValue--;

				return promise;
			});
			effect.fulfilled.subscribe(successfulSubscriber);
			effect.rejected.subscribe(failureSubscriber);

			const effectRunner = new EffectRunner(effect, {
				delay: 0,
				successfulCount: 10,
				failureCount: 5,
			});

			effectRunner.start();

			await new Promise((resolve) => effectRunner.subscribe(resolve));

			expect(successfulSubscriber).toHaveBeenCalledTimes(6);
			expect(failureSubscriber).toHaveBeenCalledTimes(5);
		});

		test("should call subscribe callback with 'successfulLimit' value", async () => {
			const successfulSubscriber = vi.fn();
			const effect = new Effect(() => Promise.resolve("test"));
			effect.fulfilled.subscribe(successfulSubscriber);

			const effectRunnerSubscriber = vi.fn();
			const effectRunner = new EffectRunner(effect, {
				delay: 0,
				successfulCount: 1,
			});
			effectRunner.subscribe(effectRunnerSubscriber);

			effectRunner.start();

			await new Promise((resolve) => effectRunner.subscribe(resolve));

			expect(successfulSubscriber).toHaveBeenCalledOnce();
			expect(effectRunnerSubscriber).toHaveBeenCalledOnce();
			expect(effectRunnerSubscriber).toHaveBeenCalledWith("successfulLimit");
		});

		test("should call subscribe callback with 'failureLimit' value", async () => {
			const failureSubscriber = vi.fn();
			const effect = new Effect(() => Promise.reject("test"));
			effect.rejected.subscribe(failureSubscriber);

			const effectRunnerSubscriber = vi.fn();
			const effectRunner = new EffectRunner(effect, {
				delay: 0,
				failureCount: 1,
			});
			effectRunner.subscribe(effectRunnerSubscriber);

			effectRunner.start();

			await new Promise((resolve) => effectRunner.subscribe(resolve));

			expect(failureSubscriber).toHaveBeenCalledOnce();
			expect(effectRunnerSubscriber).toHaveBeenCalledOnce();
			expect(effectRunnerSubscriber).toHaveBeenCalledWith("failureLimit");
		});

		test("you can pass delay as function", async () => {
			const effect = new Effect(() => Promise.resolve("test"));

			const effectRunner = new EffectRunner(effect, {
				delay: ({ successfulCount, failureCount, params, result, error }) => {
					expect(successfulCount).toBeTypeOf("number");
					expect(failureCount).toBeTypeOf("number");
					expect(params).toBeTypeOf("undefined");
					expect(result).toBe("test");
					expect(error).toBe(null);

					return 1;
				},
				successfulCount: 2,
			});

			effectRunner.start();

			await new Promise((resolve) => effectRunner.subscribe(resolve));
		});

		test("should change pending state", async () => {
			const effect = new Effect(() => Promise.resolve("test"));

			const effectRunner = new EffectRunner(effect, {
				delay: 0,
				successfulCount: 1,
			});

			expect(effectRunner.pending.get()).toBe(false);
			effectRunner.start();
			expect(effectRunner.pending.get()).toBe(true);

			await new Promise((resolve) => effectRunner.subscribe(resolve));
			expect(effectRunner.pending.get()).toBe(false);
		});
	});

	describe("stop", () => {
		test("should cancel effect is running", () => {
			const effect = new Effect(() => Promise.resolve("test"));
			const effectCancelMock = vi.fn();
			effect.cancel = effectCancelMock;

			const effectRunner = new EffectRunner(effect, {
				delay: 0,
				successfulCount: 1,
			});

			effectRunner.start();
			effectRunner.stop();

			expect(effectCancelMock).toHaveBeenCalledOnce();
		});

		test("should set false for pending state", () => {
			const effect = new Effect(() => Promise.resolve("test"));

			const effectRunner = new EffectRunner(effect, {
				delay: 0,
				successfulCount: 1,
			});

			effectRunner.start();
			effectRunner.stop();

			expect(effectRunner.pending.get()).toBe(false);
		});

		test("should unsubscribe from effect", () => {
			const effect = new Effect(() => Promise.resolve("test"));

			const effectRunnerSubscriber = vi.fn();
			const effectRunner = new EffectRunner(effect, {
				delay: 0,
				successfulCount: 3,
			});
			effectRunner.subscribe(effectRunnerSubscriber);

			effectRunner.stop();

			effect.fulfilled.dispatch({ result: "new test", params: undefined });
			effect.fulfilled.dispatch({ result: "new new test", params: undefined });
			effect.fulfilled.dispatch({
				result: "new new new test",
				params: undefined,
			});

			expect(effectRunnerSubscriber).not.toHaveBeenCalled();
		});

		test("should clear timeout", () => {
			const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
			const effect = new Effect(() => Promise.resolve("test"));

			const effectRunner = new EffectRunner(effect, {
				delay: 0,
				successfulCount: 1,
			});

			effectRunner.stop();

			expect(clearTimeoutSpy).toHaveBeenCalledOnce();
			vi.clearAllMocks();
		});
	});

	describe("trigger", () => {
		test("should subscribe on another entity", async () => {
			const effect = new Effect((value: string) => Promise.resolve(value));
			const triggerEvent = new Event<string>();
			const mockStart = vi.fn();
			const effectRunner = new EffectRunner(effect, {
				delay: 0,
				successfulCount: 1,
			});
			effectRunner.start = mockStart;
			effectRunner.trigger(triggerEvent);

			triggerEvent.dispatch("test");

			expect(mockStart).toHaveBeenCalledOnce();
			expect(mockStart).toHaveBeenCalledWith("test");
		});

		test("should subscribe on another entity and transform payload", async () => {
			const effect = new Effect((value: string) => Promise.resolve(value));
			const triggerEvent = new Event<number>();
			const mockStart = vi.fn();
			const effectRunner = new EffectRunner(effect, {
				delay: 0,
				successfulCount: 1,
			});
			effectRunner.start = mockStart;
			effectRunner.trigger(
				triggerEvent,
				(numericValue) => numericValue + "_test"
			);

			triggerEvent.dispatch(10);

			expect(mockStart).toHaveBeenCalledOnce();
			expect(mockStart).toHaveBeenCalledWith("10_test");
		});
	});

	describe("release", () => {
		test("should release entities", () => {
			const effect = new Effect(() => Promise.resolve("test"));

			const effectRunnerSubscriber = vi.fn();
			const isRunningSubscriber = vi.fn();

			const effectRunner = new EffectRunner(effect, {
				delay: 0,
				successfulCount: 3,
			});

			effectRunner.subscribe(effectRunnerSubscriber);
			effectRunner.pending.subscribe(isRunningSubscriber);

			effectRunner.release();

			effect.fulfilled.dispatch({ result: "new test", params: undefined });
			effect.fulfilled.dispatch({ result: "new new test", params: undefined });
			effect.fulfilled.dispatch({
				result: "new new new test",
				params: undefined,
			});

			expect(effectRunnerSubscriber).not.toHaveBeenCalled();
		});

		test("should call stop method", () => {
			const effect = new Effect(() => Promise.resolve("test"));

			const stopMock = vi.fn();
			const effectRunner = new EffectRunner(effect, {
				delay: 0,
				successfulCount: 3,
			});
			effectRunner.stop = stopMock;

			effectRunner.release();

			expect(stopMock).toHaveBeenCalledOnce();
		});
	});
});
