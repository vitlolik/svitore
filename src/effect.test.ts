import { describe, it, expect, vi } from "vitest";
import { Effect, EffectStatus } from "./effect";
import { Entity } from "./shared/entity";
import { State } from "./state";
import { Event } from "./event";

describe("effect", () => {
	it("type", () => {
		const effect = new Effect(() => Promise.resolve());

		expect(effect).instanceOf(Entity);
	});

	describe("statusState:state", () => {
		it("is state", () => {
			const effect = new Effect(() => Promise.resolve());

			expect(effect.statusState).instanceOf(State);
		});

		it("initial state", () => {
			const effect = new Effect(() => Promise.resolve());

			expect(effect.statusState.get()).toBe(EffectStatus.idle);
		});
	});

	describe("isPendingState:state", () => {
		it("is state", () => {
			const effect = new Effect(() => Promise.resolve());

			expect(effect.isPendingState).instanceOf(State);
		});

		it("it depends from statusState", () => {
			const effect = new Effect(() => Promise.resolve());
			expect(effect.isPendingState.get()).toBe(false);

			effect.statusState.set(EffectStatus.pending);
			expect(effect.isPendingState.get()).toBe(true);

			effect.statusState.set(EffectStatus.resolved);
			expect(effect.isPendingState.get()).toBe(false);

			effect.statusState.set(EffectStatus.rejected);
			expect(effect.isPendingState.get()).toBe(false);
		});
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

		it("call onStart event", () => {
			const effect = new Effect((value: number) => Promise.resolve(value));
			const startedEvent = new Event<number>();
			startedEvent.dispatch = vi.fn();

			effect.onStart = startedEvent;
			effect.run(100);

			expect(startedEvent.dispatch).toHaveBeenCalledTimes(1);
			expect(startedEvent.dispatch).toHaveBeenCalledWith(100);
		});

		it("call resolved event", async () => {
			const effect = new Effect(() => Promise.resolve("hello"));
			const resolvedEvent = new Event<{ params: void; result: string }>();
			resolvedEvent.dispatch = vi.fn();
			effect.onResolve = resolvedEvent;

			await effect.run();

			expect(resolvedEvent.dispatch).toHaveBeenCalledTimes(1);
			expect(resolvedEvent.dispatch).toHaveBeenCalledWith({
				params: undefined,
				result: "hello",
			});
		});

		it("return void", async () => {
			const effect = new Effect(() => Promise.resolve("hello"));

			const result = await effect.run();

			expect(result).toBe(undefined);
		});

		it("call rejected event", async () => {
			const effect = new Effect(() => Promise.reject("rejected error"));
			const rejectedEvent = new Event<{ params: void; error: Error }>();
			rejectedEvent.dispatch = vi.fn();
			effect.onReject = rejectedEvent;

			try {
				await effect.run();
			} catch {
			} finally {
				expect(rejectedEvent.dispatch).toHaveBeenCalledTimes(1);
				expect(rejectedEvent.dispatch).toHaveBeenCalledWith({
					params: undefined,
					error: "rejected error",
				});
			}
		});

		it("call aborted event", async () => {
			const abortedError = {
				name: "AbortError",
			};

			const effect = new Effect(() => {
				return Promise.reject(abortedError);
			});

			try {
				await effect.run();
			} catch (error) {
				expect(effect.onAbort.calls).toBe(1);
			}
		});

		it("throw error", async () => {
			const customError = new Error("error");
			const effect = new Effect(() => Promise.reject(customError));

			try {
				await effect.run();
			} catch (error) {
				expect(error).toBe(customError);
			}
		});

		describe("call finished event always", () => {
			it("on resolved", async () => {
				const effect = new Effect((value: string) => Promise.resolve(value));
				const finishedEvent = new Event<string>();
				finishedEvent.dispatch = vi.fn();
				effect.onFinish = finishedEvent;

				await effect.run("hello");

				expect(finishedEvent.dispatch).toHaveBeenCalledTimes(1);
				expect(finishedEvent.dispatch).toHaveBeenCalledWith("hello");
			});

			it("on rejected", async () => {
				const effect = new Effect((value: string) => Promise.reject(value));
				const finishedEvent = new Event<string>();
				finishedEvent.dispatch = vi.fn();
				effect.onFinish = finishedEvent;

				try {
					await effect.run("hello");
				} catch (error) {
					expect(finishedEvent.dispatch).toHaveBeenCalledTimes(1);
					expect(finishedEvent.dispatch).toHaveBeenCalledWith("hello");
				}
			});
		});
	});
});
