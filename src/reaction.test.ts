import { describe, it, expect, vi } from "vitest";

import { Entity } from "./shared";
import { Reaction } from "./reaction";
import { State } from "./state";

describe("reaction", () => {
	it("type", () => {
		const state = new State("test");
		const reaction = new Reaction(state, () => null);

		expect(reaction).instanceOf(Entity);

		reaction.release();
	});

	it("should call reaction-callback with state payload, when states changed", async () => {
		const stat1 = new State("test");
		const state2 = new State(0);
		const reactionCallback = vi.fn();

		const reaction = new Reaction(stat1, state2, reactionCallback);

		stat1.set("new test");
		// because callback invoked as microtask
		await Promise.resolve();

		expect(reactionCallback).toHaveBeenCalledTimes(1);
		expect(reactionCallback).toHaveBeenCalledWith("new test", 0);

		state2.set(1);
		// because callback invoked as microtask
		await Promise.resolve();

		expect(reactionCallback).toHaveBeenCalledTimes(2);
		expect(reactionCallback).toHaveBeenCalledWith("new test", 1);

		reaction.release();
	});

	it("should call reaction-callback once even states change synchronously many times", async () => {
		const stat1 = new State("test");
		const state2 = new State(0);
		const reactionCallback = vi.fn();

		const reaction = new Reaction(stat1, state2, reactionCallback);

		stat1.set("new test");
		state2.set(1);
		// because callback invoked as microtask
		await Promise.resolve();

		expect(reactionCallback).toHaveBeenCalledTimes(1);
		expect(reactionCallback).toHaveBeenCalledWith("new test", 1);

		reaction.release();
	});

	it("release - should unsubscribe from states", async () => {
		const stat1 = new State("test");
		const state2 = new State(0);
		const reactionCallback = vi.fn();

		const reaction = new Reaction(stat1, state2, reactionCallback);
		reaction.release();

		stat1.set("new test");
		state2.set(1);
		// because callback invoked as microtask
		await Promise.resolve();

		expect(reactionCallback).toHaveBeenCalledTimes(0);
	});
});
