import { describe, it, expect, vi } from "vitest";
import { SvitoreModule } from "./svitore-module";
import {
	ComputedState,
	DebouncedEvent,
	Effect,
	Event,
	PersistState,
	Reaction,
	State,
	ThrottledEvent,
} from "./entities";

describe("SvitoreModule", () => {
	describe("initState", () => {
		it("should create state and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const state = testModule.initState("test state");

			expect(state).instanceOf(State);
			expect(testModule.entities).toHaveLength(1);
		});
	});

	describe("initComputedState", () => {
		it("should create computed state and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const state = testModule.initState("test state");
			const computedState = testModule.initComputedState(state, (value) =>
				value.toUpperCase()
			);

			expect(computedState).instanceOf(ComputedState);
			expect(testModule.entities).toHaveLength(2);
		});
	});

	describe("initPersistState", () => {
		it("should create persist state and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const persistState = testModule.initPersistState(
				"test persist state",
				"test-key"
			);

			expect(persistState).instanceOf(PersistState);
			expect(testModule.entities).toHaveLength(1);
		});
	});

	describe("initEvent", () => {
		it("should create event and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const event = testModule.initEvent();

			expect(event).instanceOf(Event);
			expect(testModule.entities).toHaveLength(1);
		});
	});

	describe("initDebouncedEvent", () => {
		it("should create debounced event and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const debouncedEvent = testModule.initDebouncedEvent(100);

			expect(debouncedEvent).instanceOf(DebouncedEvent);
			expect(testModule.entities).toHaveLength(1);
		});
	});

	describe("initThrottledEvent", () => {
		it("should create throttled event and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const throttledEvent = testModule.initThrottledEvent(100);

			expect(throttledEvent).instanceOf(ThrottledEvent);
			expect(testModule.entities).toHaveLength(1);
		});
	});

	describe("initEffect", () => {
		it("should create effect and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const effect = testModule.initEffect(() => Promise.resolve());

			expect(effect).instanceOf(Effect);
			expect(testModule.entities).toHaveLength(1);
		});
	});

	describe("initReaction", () => {
		it("should create reaction and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const state = testModule.initState("test state");
			const reaction = testModule.initReaction(state, () => {});

			expect(reaction).instanceOf(Reaction);
			expect(testModule.entities).toHaveLength(2);
		});
	});

	describe("resetState", () => {
		it("should call reset state on each state entity except computed state", () => {
			const testModule = new SvitoreModule("test");
			const simpleState = testModule.initState("simple state");
			const persistState = testModule.initPersistState(
				"persist state",
				"test-key"
			);
			const computedState = testModule.initComputedState(
				simpleState,
				(value) => value
			);

			simpleState.reset = vi.fn();
			persistState.reset = vi.fn();
			computedState.reset = vi.fn();

			testModule.resetState();

			expect(simpleState.reset).toHaveBeenCalledOnce();
			expect(persistState.reset).toHaveBeenCalledOnce();
			expect(computedState.reset).not.toHaveBeenCalled();
		});
	});

	describe("release", () => {
		it("should call release on each entity", () => {
			const testModule = new SvitoreModule("test");

			const state = testModule.initState("state");
			const event = testModule.initEvent();
			const effect = testModule.initEffect(() => Promise.resolve());
			const reaction = testModule.initReaction(state, () => {});

			state.release = vi.fn();
			event.release = vi.fn();
			effect.release = vi.fn();
			reaction.release = vi.fn();

			testModule.release();

			expect(state.release).toHaveBeenCalledOnce();
			expect(event.release).toHaveBeenCalledOnce();
			expect(effect.release).toHaveBeenCalledOnce();
			expect(reaction.release).toHaveBeenCalledOnce();
		});
	});
});
