import { describe, test, expect, vi } from "vitest";

import { Entity } from "./services";
import { Reaction } from "./reaction";
import { State } from "./state";
import { Event } from "./event";

describe("reaction", () => {
	test("type", () => {
		const state = new State("test");
		const reaction = new Reaction(state, () => null);

		expect(reaction).instanceOf(Entity);

		reaction.release();
	});

	test("should call reaction-callback with state payload, when states changed", async () => {
		const change1 = new Event<string>();
		const change2 = new Event<number>();
		const stat1 = new State("test").changeOn(change1);
		const state2 = new State(0).changeOn(change2);
		const reactionCallback = vi.fn();

		const reaction = new Reaction(stat1, state2, reactionCallback);

		change1.dispatch("new test");
		// because callback invoked as microtask
		await Promise.resolve();

		expect(reactionCallback).toHaveBeenCalledTimes(1);
		expect(reactionCallback).toHaveBeenCalledWith("new test", 0);

		change2.dispatch(1);
		// because callback invoked as microtask
		await Promise.resolve();

		expect(reactionCallback).toHaveBeenCalledTimes(2);
		expect(reactionCallback).toHaveBeenCalledWith("new test", 1);

		reaction.release();
	});

	test("should call reaction-callback once even states change synchronously many times", async () => {
		const change1 = new Event<string>();
		const change2 = new Event<number>();
		const stat1 = new State("test").changeOn(change1);
		const state2 = new State(0).changeOn(change2);
		const reactionCallback = vi.fn();

		const reaction = new Reaction(stat1, state2, reactionCallback);

		change1.dispatch("new test");
		change2.dispatch(1);
		// because callback invoked as microtask
		await Promise.resolve();

		expect(reactionCallback).toHaveBeenCalledTimes(1);
		expect(reactionCallback).toHaveBeenCalledWith("new test", 1);

		reaction.release();
	});

	test("release - should unsubscribe from states", async () => {
		const change1 = new Event<string>();
		const change2 = new Event<number>();
		const stat1 = new State("test").changeOn(change1);
		const state2 = new State(0).changeOn(change2);
		const reactionCallback = vi.fn();

		const reaction = new Reaction(stat1, state2, reactionCallback);
		reaction.release();

		change1.dispatch("new test");
		change2.dispatch(1);
		// because callback invoked as microtask
		await Promise.resolve();

		expect(reactionCallback).toHaveBeenCalledTimes(0);
	});
});
