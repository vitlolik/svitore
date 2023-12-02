import { describe, expect, vi, test } from "vitest";
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
import { ModuleExistsError } from "./utils/error";

describe("SvitoreModule", () => {
	describe("Module", () => {
		test("should create new child module with correct name", () => {
			const parentModule = new SvitoreModule("parent");
			const childModule = parentModule.Module("child");

			expect(parentModule.modules).toHaveLength(1);
			expect(childModule.name).toBe("parent:child");
		});

		test("should throw error if module already exist", () => {
			const parent = new SvitoreModule("parent");
			parent.Module("child");

			try {
				parent.Module("child");
				expect(false).toBe(true);
			} catch (error) {
				expect(error).instanceOf(ModuleExistsError);
				expect((error as any).message).toBe(
					'Module with name "parent:child" already exists'
				);
			}
		});
	});

	describe("State", () => {
		test("should create state and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const state = testModule.State("test state");

			expect(state).instanceOf(State);
			expect(testModule.entities).toHaveLength(1);
		});
	});

	describe("ComputedState", () => {
		test("should create computed state and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const state = testModule.State("test state");
			const computedState = testModule.ComputedState(state, (value) =>
				value.toUpperCase()
			);

			expect(computedState).instanceOf(ComputedState);
			expect(testModule.entities).toHaveLength(2);
		});
	});

	describe("PersistState", () => {
		test("should create persist state and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const persistState = testModule.PersistState(
				"test persist state",
				"test-key"
			);

			expect(persistState).instanceOf(PersistState);
			expect(testModule.entities).toHaveLength(1);
		});
	});

	describe("Event", () => {
		test("should create event and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const event = testModule.Event();

			expect(event).instanceOf(Event);
			expect(testModule.entities).toHaveLength(1);
		});
	});

	describe("DebouncedEvent", () => {
		test("should create debounced event and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const debouncedEvent = testModule.DebouncedEvent(100);

			expect(debouncedEvent).instanceOf(DebouncedEvent);
			expect(testModule.entities).toHaveLength(1);
		});
	});

	describe("ThrottledEvent", () => {
		test("should create throttled event and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const throttledEvent = testModule.ThrottledEvent(100);

			expect(throttledEvent).instanceOf(ThrottledEvent);
			expect(testModule.entities).toHaveLength(1);
		});
	});

	describe("Effect", () => {
		test("should create effect and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const effect = testModule.Effect(() => Promise.resolve());

			expect(effect).instanceOf(Effect);
			expect(testModule.entities).toHaveLength(1);
		});
	});

	describe("EffectRunner", () => {
		test("should create effect runner and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const effect = testModule.Effect(() => Promise.resolve());
			const effectRunner = testModule.EffectRunner(effect, {
				delay: () => 0,
				while: ({ fulfilled }) => fulfilled <= 1,
			});

			expect(effectRunner).instanceOf(EffectRunner);
			expect(testModule.entities).toHaveLength(2);
		});
	});

	describe("Reaction", () => {
		test("should create reaction and save instance to module", () => {
			const testModule = new SvitoreModule("test");
			const state = testModule.State("test state");
			const reaction = testModule.Reaction(state, () => {});

			expect(reaction).instanceOf(Reaction);
			expect(testModule.entities).toHaveLength(2);
		});
	});

	describe("reset", () => {
		test("should call reset state on each state entity except computed state", () => {
			const testModule = new SvitoreModule("test");
			const changeEvent = testModule.Event<string>();
			const simpleState = testModule
				.State("simple state")
				.changeOn(changeEvent);
			const persistState = testModule
				.PersistState("persist state", "test-key")
				.changeOn(changeEvent);

			changeEvent.dispatch("new test value");

			testModule.reset();

			expect(simpleState.get()).toBe("simple state");
			expect(persistState.get()).toBe("persist state");
		});

		test("should reset state in each child module", () => {
			const parent = new SvitoreModule("parent");
			const firstChild = parent.Module("1");
			const secondChild = parent.Module("2");
			const mockReset = vi.fn();

			firstChild.reset = mockReset;
			secondChild.reset = mockReset;

			parent.reset();

			expect(mockReset).toHaveBeenCalledTimes(2);
		});
	});

	describe("release", () => {
		test("should call release on each entity", () => {
			const testModule = new SvitoreModule("test");

			const state = testModule.State("state");
			const event = testModule.Event();
			const effect = testModule.Effect(() => Promise.resolve());
			const reaction = testModule.Reaction(state, () => {});

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

		test("should call release on each child module", () => {
			const parent = new SvitoreModule("parent");
			const firstChild = parent.Module("1");
			const secondChild = parent.Module("2");
			const mockRelease = vi.fn();

			firstChild.release = mockRelease;
			secondChild.release = mockRelease;

			parent.release();

			expect(mockRelease).toHaveBeenCalledTimes(2);
		});
	});
});
