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

		it("subscribe to events", () => {
			const effect = new Effect(() => Promise.resolve());

			effect.started.dispatch();
			expect(effect.statusState.get()).toBe(EffectStatus.pending);

			effect.resolved.dispatch({ result: undefined, params: undefined });
			expect(effect.statusState.get()).toBe(EffectStatus.resolved);

			effect.rejected.dispatch({ error: new Error(), params: undefined });
			expect(effect.statusState.get()).toBe(EffectStatus.rejected);
		});
	});

	describe("pendingState:state", () => {
		it("is state", () => {
			const effect = new Effect(() => Promise.resolve());

			expect(effect.pendingState).instanceOf(State);
		});

		it("it depends from statusState", () => {
			const effect = new Effect(() => Promise.resolve());
			expect(effect.pendingState.get()).toBe(false);

			effect.statusState.set(EffectStatus.pending);
			expect(effect.pendingState.get()).toBe(true);

			effect.statusState.set(EffectStatus.resolved);
			expect(effect.pendingState.get()).toBe(false);

			effect.statusState.set(EffectStatus.rejected);
			expect(effect.pendingState.get()).toBe(false);
		});
	});

	describe("runningCountState:state", () => {
		it("is state", () => {
			const effect = new Effect(() => Promise.resolve());

			expect(effect.runningCountState).instanceOf(State);
		});

		it("calc in flight effects count", async () => {
			const effect = new Effect(() => Promise.resolve());
			expect(effect.runningCountState.get()).toBe(0);

			effect.run();
			effect.run();
			effect.run();
			expect(effect.runningCountState.get()).toBe(3);

			await Promise.resolve();
			expect(effect.runningCountState.get()).toBe(0);
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

		it("can accept abort controller", () => {
			const noop = () => null;
			const mockAbortController: AbortController = {
				abort: () => null,
				signal: {
					...new AbortController().signal,
					addEventListener: vi.fn(),
				},
			};
			const effect = new Effect((_, abortController) => {
				abortController.signal.addEventListener("abort", noop);
				return Promise.resolve();
			});

			effect.run(undefined, mockAbortController);

			expect(mockAbortController.signal.addEventListener).toHaveBeenCalledTimes(
				1
			);
			expect(mockAbortController.signal.addEventListener).toHaveBeenCalledWith(
				"abort",
				noop
			);
		});

		it("call started event", () => {
			const effect = new Effect((value: number) => Promise.resolve(value));
			const startedEvent = new Event<number>();
			startedEvent.dispatch = vi.fn();

			effect.started = startedEvent;
			effect.run(100);

			expect(startedEvent.dispatch).toHaveBeenCalledTimes(1);
			expect(startedEvent.dispatch).toHaveBeenCalledWith(100);
		});

		it("call resolved event", async () => {
			const effect = new Effect(() => Promise.resolve("hello"));
			const resolvedEvent = new Event<{ params: void; result: string }>();
			resolvedEvent.dispatch = vi.fn();
			effect.resolved = resolvedEvent;

			await effect.run();

			expect(resolvedEvent.dispatch).toHaveBeenCalledTimes(1);
			expect(resolvedEvent.dispatch).toHaveBeenCalledWith({
				params: undefined,
				result: "hello",
			});
		});

		it("return result", async () => {
			const effect = new Effect(() => Promise.resolve("hello"));

			const result = await effect.run();

			expect(result).toBe("hello");
		});

		it("call rejected event", async () => {
			const effect = new Effect(() => Promise.reject("rejected error"));
			const rejectedEvent = new Event<{ params: void; error: Error }>();
			rejectedEvent.dispatch = vi.fn();
			effect.rejected = rejectedEvent;

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
				expect(effect.aborted.calls).toBe(1);
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
				effect.finished = finishedEvent;

				await effect.run("hello");

				expect(finishedEvent.dispatch).toHaveBeenCalledTimes(1);
				expect(finishedEvent.dispatch).toHaveBeenCalledWith("hello");
			});

			it("on rejected", async () => {
				const effect = new Effect((value: string) => Promise.reject(value));
				const finishedEvent = new Event<string>();
				finishedEvent.dispatch = vi.fn();
				effect.finished = finishedEvent;

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
