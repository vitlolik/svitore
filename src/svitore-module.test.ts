import { describe, it, expect, vi } from "vitest";
import { SvitoreModule } from "./svitore-module";
import {
	ComputedState,
	DebouncedEvent,
	Effect,
	EffectRunner,
	Event,
	PersistState,
	Reaction,
	State,
	ThrottledEvent,
} from "./entities";

describe("SvitoreModule", () => {
	describe("createState", () => {
		it("should create state and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const state = testModule.createState("test state");

			expect(state).instanceOf(State);
			expect(testModule.entities).toHaveLength(1);
		});
	});

	describe("createComputedState", () => {
		it("should create computed state and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const state = testModule.createState("test state");
			const computedState = testModule.createComputedState(state, (value) =>
				value.toUpperCase()
			);

			expect(computedState).instanceOf(ComputedState);
			expect(testModule.entities).toHaveLength(2);
		});
	});

	describe("createPersistState", () => {
		it("should create persist state and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const persistState = testModule.createPersistState(
				"test persist state",
				"test-key"
			);

			expect(persistState).instanceOf(PersistState);
			expect(testModule.entities).toHaveLength(1);
		});
	});

	describe("createEvent", () => {
		it("should create event and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const event = testModule.createEvent();

			expect(event).instanceOf(Event);
			expect(testModule.entities).toHaveLength(1);
		});
	});

	describe("createDebouncedEvent", () => {
		it("should create debounced event and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const debouncedEvent = testModule.createDebouncedEvent(100);

			expect(debouncedEvent).instanceOf(DebouncedEvent);
			expect(testModule.entities).toHaveLength(1);
		});
	});

	describe("initThrottledEvent", () => {
		it("should create throttled event and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const throttledEvent = testModule.createThrottledEvent(100);

			expect(throttledEvent).instanceOf(ThrottledEvent);
			expect(testModule.entities).toHaveLength(1);
		});
	});

	describe("createEffect", () => {
		it("should create effect and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const effect = testModule.createEffect(() => Promise.resolve());

			expect(effect).instanceOf(Effect);
			expect(testModule.entities).toHaveLength(1);
		});
	});

	describe("createEffectRunner", () => {
		it("should create effect runner and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const effect = testModule.createEffect(() => Promise.resolve());
			const effectRunner = testModule.createEffectRunner(effect, { delay: 0 });

			expect(effectRunner).instanceOf(EffectRunner);
			expect(testModule.entities).toHaveLength(2);
		});
	});

	describe("createReaction", () => {
		it("should create reaction and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const state = testModule.createState("test state");
			const reaction = testModule.createReaction(state, () => {});

			expect(reaction).instanceOf(Reaction);
			expect(testModule.entities).toHaveLength(2);
		});
	});

	describe("resetState", () => {
		it("should call reset state on each state entity except computed state", () => {
			const testModule = new SvitoreModule("test");
			const changeEvent = testModule.createEvent<string>();
			const simpleState = testModule
				.createState("simple state")
				.changeOn(changeEvent);
			const persistState = testModule
				.createPersistState("persist state", "test-key")
				.changeOn(changeEvent);

			changeEvent.dispatch("new test value");

			testModule.resetState();

			expect(simpleState.get()).toBe("simple state");
			expect(persistState.get()).toBe("persist state");
		});
	});

	describe("release", () => {
		it("should call release on each entity", () => {
			const testModule = new SvitoreModule("test");

			const state = testModule.createState("state");
			const event = testModule.createEvent();
			const effect = testModule.createEffect(() => Promise.resolve());
			const reaction = testModule.createReaction(state, () => {});

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
