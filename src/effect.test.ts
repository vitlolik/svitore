import { describe, it, expect, vi } from "vitest";

import { Effect } from "./effect";
import { Entity } from "./shared";

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

		it("should set pending state on running", async () => {
			const effect = new Effect(() => Promise.resolve("hello"));
			const promise = effect.run();
			expect(effect.isPending.get()).toBe(true);

			await promise;
		});

		it("should abort if needed", async () => {
			const abortListener = vi.fn();
			const effect = new Effect(
				async (_data, abortController) => {
					abortController.signal.addEventListener("abort", abortListener);
					await Promise.resolve("hello");
				},
				{ isAutoAbort: true }
			);

			effect.run();
			effect.run();

			expect(abortListener).toHaveBeenCalledTimes(1);
		});

		it("should set pending state on finished", async () => {
			const effectFulfilled = new Effect(() => Promise.resolve("hello"));
			const effectRejected = new Effect(() => Promise.reject("error"));

			expect(effectFulfilled.isPending.get()).toBe(false);
			const effectFulfilledPromise = effectFulfilled.run();
			expect(effectFulfilled.isPending.get()).toBe(true);
			await effectFulfilledPromise;
			expect(effectFulfilled.isPending.get()).toBe(false);

			expect(effectRejected.isPending.get()).toBe(false);
			const effectRejectedPromise = effectRejected.run();
			expect(effectRejected.isPending.get()).toBe(true);
			await effectRejectedPromise;
			expect(effectRejected.isPending.get()).toBe(false);
		});

		it("should notify listeners on finished", async () => {
			const listenerFulfilled = vi.fn();
			const listenerRejected = vi.fn();
			const effectFulfilled = new Effect(() => Promise.resolve("hello"));
			const effectRejected = new Effect(() => Promise.reject("error"));

			effectFulfilled.subscribe(listenerFulfilled);
			effectRejected.subscribe(listenerRejected);

			await Promise.all([effectFulfilled.run(), effectRejected.run()]);

			expect(listenerFulfilled).toHaveBeenCalledTimes(1);
			expect(listenerFulfilled).toHaveBeenCalledWith(
				{
					state: "fulfilled",
					params: undefined,
					result: "hello",
				},
				effectFulfilled
			);
			expect(listenerRejected).toHaveBeenCalledTimes(1);
			expect(listenerRejected).toHaveBeenCalledWith(
				{
					state: "rejected",
					params: undefined,
					error: "error",
				},
				effectRejected
			);
		});
	});

	it("clone - should clone an effect with existing effect function", () => {
		const effect = new Effect(() => Promise.resolve());

		expect(effect.clone({ isAutoAbort: true })).instanceOf(Entity);
	});

	it("abort - should abort effect and set change pending state", () => {
		const abortListener = vi.fn();
		const effect = new Effect(async (_data, abortController) => {
			abortController.signal.addEventListener("abort", abortListener);
			await Promise.resolve("hello");
		});
		effect.run();
		expect(effect.isPending.get()).toBe(true);

		effect.abort();
		expect(effect.isPending.get()).toBe(false);
		expect(abortListener).toHaveBeenCalledTimes(1);
	});

	it("release - should abort and remove subscribers", async () => {
		const pendingSubscriber = vi.fn();
		const effectSubscriber = vi.fn();
		const effect = new Effect(() => Promise.resolve("hello"));
		effect.abort = vi.fn();
		effect.subscribe(effectSubscriber);
		effect.isPending.subscribe(pendingSubscriber);

		effect.release();

		await effect.run();

		expect(effect.abort).toHaveBeenCalledTimes(1);
		expect(effectSubscriber).toHaveBeenCalledTimes(0);
		expect(pendingSubscriber).toHaveBeenCalledTimes(0);
	});

	it("if happened auto-abort with specific error, subscribers should not be notified", async () => {
		const subscriber = vi.fn();
		const autoAbortEmulateEffect = new Effect(
			() => {
				const abortError = new Error();
				abortError.name = "AbortError";
				return Promise.reject(abortError);
			},
			{ isAutoAbort: true }
		);
		autoAbortEmulateEffect.subscribe(subscriber);

		await autoAbortEmulateEffect.run();

		expect(subscriber).toHaveBeenCalledTimes(0);
	});
});
