import { describe, it, expect, vi } from "vitest";
import { Effect } from "./effect";
import { EffectStatus } from "./types";
import { Entity } from "./shared/entity";
import { State } from "./state";
import { Event } from "./event";

describe("effect", () => {
	it("type", () => {
		const effect = new Effect(() => Promise.resolve());

		expect(effect).instanceOf(Entity);
	});

	describe("$status:state", () => {
		it("is state", () => {
			const effect = new Effect(() => Promise.resolve());

			expect(effect.$status).instanceOf(State);
		});

		it("initial state", () => {
			const effect = new Effect(() => Promise.resolve());

			expect(effect.$status.get()).toBe(EffectStatus.idle);
		});

		it("subscribe to events", () => {
			const effect = new Effect(() => Promise.resolve());

			effect.started.fire();
			expect(effect.$status.get()).toBe(EffectStatus.pending);

			effect.resolved.fire({ result: undefined, params: undefined });
			expect(effect.$status.get()).toBe(EffectStatus.resolved);

			effect.rejected.fire({ error: new Error(), params: undefined });
			expect(effect.$status.get()).toBe(EffectStatus.rejected);
		});
	});

	describe("$pending:state", () => {
		it("is state", () => {
			const effect = new Effect(() => Promise.resolve());

			expect(effect.$pending).instanceOf(State);
		});

		it("it depends from $status", () => {
			const effect = new Effect(() => Promise.resolve());
			expect(effect.$pending.get()).toBe(false);

			effect.$status.inform(EffectStatus.pending);
			expect(effect.$pending.get()).toBe(true);

			effect.$status.inform(EffectStatus.resolved);
			expect(effect.$pending.get()).toBe(false);

			effect.$status.inform(EffectStatus.rejected);
			expect(effect.$pending.get()).toBe(false);
		});
	});

	describe("$runningCount:state", () => {
		it("is state", () => {
			const effect = new Effect(() => Promise.resolve());

			expect(effect.$runningCount).instanceOf(State);
		});

		it("calc in flight effects count", async () => {
			const effect = new Effect(() => Promise.resolve());
			expect(effect.$runningCount.get()).toBe(0);

			effect.run();
			effect.run();
			effect.run();
			expect(effect.$runningCount.get()).toBe(3);

			await Promise.resolve();
			expect(effect.$runningCount.get()).toBe(0);
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

	describe("onReset", () => {
		it("effect function", () => {
			const effectFunction = vi.fn(() => Promise.resolve());
			const newEffectFunction = vi.fn(() => Promise.resolve());
			const effect = new Effect(effectFunction);
			const resetEvent = new Event();
			effect.onReset(resetEvent);

			effect.run();
			expect(effectFunction).toHaveBeenCalledTimes(1);

			effect.implement(newEffectFunction);
			effect.run();
			expect(effectFunction).toHaveBeenCalledTimes(1);
			expect(newEffectFunction).toHaveBeenCalledTimes(1);

			resetEvent.fire();
			effect.run();
			expect(effectFunction).toHaveBeenCalledTimes(2);
			expect(newEffectFunction).toHaveBeenCalledTimes(1);
		});

		it("state", () => {
			const effectFunction = vi.fn(() => Promise.resolve());

			const effect = new Effect(effectFunction);
			const resetEvent = new Event();
			effect.onReset(resetEvent);
			effect.$status.inform(EffectStatus.pending);

			expect(effect.$status.get()).toBe(EffectStatus.pending);
			expect(effect.$pending.get()).toBe(true);

			resetEvent.fire();

			expect(effect.$status.get()).toBe(EffectStatus.idle);
			expect(effect.$pending.get()).toBe(false);
		});
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
			startedEvent.fire = vi.fn();

			effect.started = startedEvent;
			effect.run(100);

			expect(startedEvent.fire).toHaveBeenCalledTimes(1);
			expect(startedEvent.fire).toHaveBeenCalledWith(100);
		});

		it("call resolved event", async () => {
			const effect = new Effect(() => Promise.resolve("hello"));
			const resolvedEvent = new Event<{ params: void; result: string }>();
			resolvedEvent.fire = vi.fn();
			effect.resolved = resolvedEvent;

			await effect.run();

			expect(resolvedEvent.fire).toHaveBeenCalledTimes(1);
			expect(resolvedEvent.fire).toHaveBeenCalledWith({
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
			rejectedEvent.fire = vi.fn();
			effect.rejected = rejectedEvent;

			try {
				await effect.run();
			} catch {
			} finally {
				expect(rejectedEvent.fire).toHaveBeenCalledTimes(1);
				expect(rejectedEvent.fire).toHaveBeenCalledWith({
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
				expect(effect.aborted.payload).toEqual({
					error: abortedError,
				});
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
				finishedEvent.fire = vi.fn();
				effect.finished = finishedEvent;

				await effect.run("hello");

				expect(finishedEvent.fire).toHaveBeenCalledTimes(1);
				expect(finishedEvent.fire).toHaveBeenCalledWith("hello");
			});

			it("on rejected", async () => {
				const effect = new Effect((value: string) => Promise.reject(value));
				const finishedEvent = new Event<string>();
				finishedEvent.fire = vi.fn();
				effect.finished = finishedEvent;

				try {
					await effect.run("hello");
				} catch (error) {
					expect(finishedEvent.fire).toHaveBeenCalledTimes(1);
					expect(finishedEvent.fire).toHaveBeenCalledWith("hello");
				}
			});
		});
	});

	it("inform", () => {
		const effect = new Effect((value: string) => Promise.resolve(value));
		const run = vi.fn();
		effect.run = run;

		effect.inform("test");
		expect(run).toHaveBeenCalledTimes(1);
		expect(run).toHaveBeenCalledWith("test");
	});
});
