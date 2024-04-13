import { describe, expect, test, vi } from "vitest";

import { Effect } from "./effect";
import { Event } from "./event";
import { Entity } from "./services";

describe("effect", () => {
	test("type", () => {
		const effect = new Effect(() => Promise.resolve());

		expect(effect).instanceOf(Entity);
	});

	describe("run", () => {
		test("return promise", () => {
			const effect = new Effect(() => Promise.resolve());
			const runResult = effect.run();

			expect(runResult).instanceOf(Promise);
		});

		test("return void", async () => {
			const effect = new Effect(() => Promise.resolve("hello"));

			const result = await effect.run();

			expect(result).toBe(undefined);
		});

		test("should set pending state on running", async () => {
			const effect = new Effect(() => Promise.resolve("hello"));
			const promise = effect.run();
			expect(effect.pending.get()).toBe(true);

			await promise;
		});

		test("should abort if needed", async () => {
			const abortListener = vi.fn();
			const effect = new Effect(
				async (_data, signal) => {
					signal.addEventListener("abort", abortListener);
					await Promise.resolve("hello");
				},
				{ isAutoCancelable: true },
			);

			effect.run();
			effect.run();

			expect(abortListener).toHaveBeenCalledTimes(1);
		});

		test("should set pending state on finished", async () => {
			const effectFulfilled = new Effect(() => Promise.resolve("hello"));
			const effectRejected = new Effect(() => Promise.reject("error"));

			expect(effectFulfilled.pending.get()).toBe(false);
			const effectFulfilledPromise = effectFulfilled.run();
			expect(effectFulfilled.pending.get()).toBe(true);
			await effectFulfilledPromise;
			expect(effectFulfilled.pending.get()).toBe(false);

			expect(effectRejected.pending.get()).toBe(false);
			const effectRejectedPromise = effectRejected.run();
			expect(effectRejected.pending.get()).toBe(true);
			await effectRejectedPromise;
			expect(effectRejected.pending.get()).toBe(false);
		});

		test("should notify listeners on finished", async () => {
			const listenerFulfilled = vi.fn();
			const listenerRejected = vi.fn();
			const effectFulfilled = new Effect(() => Promise.resolve("hello"));
			const effectRejected = new Effect(() => Promise.reject("error"));

			effectFulfilled.subscribe(listenerFulfilled);
			effectRejected.subscribe(listenerRejected);

			await Promise.all([effectFulfilled.run(), effectRejected.run()]);

			expect(listenerFulfilled).toHaveBeenCalledTimes(1);
			expect(listenerFulfilled).toHaveBeenCalledWith({
				state: "fulfilled",
				params: undefined,
				result: "hello",
			});
			expect(listenerRejected).toHaveBeenCalledTimes(1);
			expect(listenerRejected).toHaveBeenCalledWith({
				state: "rejected",
				params: undefined,
				error: "error",
			});
		});
	});

	test("abort - should abort effect and set change pending state", () => {
		const abortListener = vi.fn();
		const effect = new Effect(async (_data, signal) => {
			signal.addEventListener("abort", abortListener);
			await Promise.resolve("hello");
		});
		effect.run();
		expect(effect.pending.get()).toBe(true);

		effect.cancel();
		expect(effect.pending.get()).toBe(false);
		expect(abortListener).toHaveBeenCalledTimes(1);
	});

	test("release - should abort and remove subscribers", async () => {
		const pendingSubscriber = vi.fn();
		const effectSubscriber = vi.fn();
		const effect = new Effect(() => Promise.resolve("hello"));
		effect.cancel = vi.fn();
		effect.subscribe(effectSubscriber);
		effect.pending.subscribe(pendingSubscriber);

		effect.release();

		await effect.run();

		expect(effect.cancel).toHaveBeenCalledTimes(1);
		expect(effectSubscriber).toHaveBeenCalledTimes(0);
		expect(pendingSubscriber).toHaveBeenCalledTimes(0);
	});

	test("if happened auto-abort with specific error, subscribers should not be notified", async () => {
		const subscriber = vi.fn();
		const autoAbortEmulateEffect = new Effect(
			() => {
				const abortError = new Error();
				abortError.name = "AbortError";
				return Promise.reject(abortError);
			},
			{ isAutoCancelable: true },
		);
		autoAbortEmulateEffect.subscribe(subscriber);

		await autoAbortEmulateEffect.run();

		expect(subscriber).toHaveBeenCalledTimes(0);
	});

	describe("on", () => {
		test("should subscribe on another entity", async () => {
			const effect = new Effect((value: string) => Promise.resolve(value));
			const triggerEvent = new Event<string>();
			const mockRun = vi.fn();

			effect.on(triggerEvent);
			effect.run = mockRun;

			triggerEvent.dispatch("test");

			expect(mockRun).toHaveBeenCalledOnce();
			expect(mockRun).toHaveBeenCalledWith("test");
		});

		test("should subscribe on another entity and transform payload", async () => {
			const effect = new Effect((value: string) => Promise.resolve(value));
			const triggerEvent = new Event<number>();
			const mockRun = vi.fn();

			effect.on(triggerEvent, (numericValue) => `${numericValue}_test`);
			effect.run = mockRun;

			triggerEvent.dispatch(10);

			expect(mockRun).toHaveBeenCalledOnce();
			expect(mockRun).toHaveBeenCalledWith("10_test");
		});
	});
});
