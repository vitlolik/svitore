import { AbstractEvent, Middleware, Svitore, AbstractState } from "../src";

type Store = {
	changeFirstName: AbstractEvent<string>;
	changeSecondName: AbstractEvent<string>;
	changeAge: AbstractEvent<number>;
	submitted: AbstractEvent<void>;
	resetEvent: AbstractEvent<void>;

	symbolsCountState: AbstractState<number>;
	firstNameState: AbstractState<string>;
	secondNameState: AbstractState<string>;
	ageState: AbstractState<number>;
};

const logMiddleware: Middleware<any> = (context, next) => {
	console.log(context);
	next();
};

const createStore = (): Store => {
	// define
	const demoFormModule = Svitore.Module("demo form");

	const changeFirstName = demoFormModule.Event<string>();
	const changeSecondName = demoFormModule.Event<string>();
	const changeAge = demoFormModule.Event<number>();
	const submitted = demoFormModule.Event();
	const resetEvent = demoFormModule.Event();
	const debouncedSubmitEvent = demoFormModule.DebouncedEvent(500);
	const throttledSubmitEvent = demoFormModule.ThrottledEvent(500);

	const firstNameState = demoFormModule.PersistState(
		"",
		"firstName",
		window.sessionStorage
	);
	const secondNameState = demoFormModule.PersistState(
		"",
		"lastName",
		window.sessionStorage
	);
	const ageState = demoFormModule.PersistState(1, "age", window.sessionStorage);

	const symbolsCountState = demoFormModule.ComputedState(
		firstNameState,
		secondNameState,
		(firstName, secondName) =>
			firstName.trim().length + secondName.trim().length
	);

	const logEffect = demoFormModule.Effect(() => {
		console.log("УРА !");

		return Promise.resolve();
	});

	const logEffectRunner = demoFormModule.EffectRunner(logEffect, {
		delay: ({ fulfilled }) => fulfilled * 1500,
		while: ({ fulfilled }) => fulfilled < 3,
	});

	logEffectRunner.pending.subscribe(console.log);

	// logic
	changeFirstName.applyMiddleware(logMiddleware);
	changeSecondName.applyMiddleware(logMiddleware);

	ageState.changeOn(changeAge);
	firstNameState.changeOn(changeFirstName);
	secondNameState.changeOn(changeSecondName);

	logEffectRunner.subscribe(console.log);

	debouncedSubmitEvent.subscribe(() => {
		console.log("debouncedSubmitEvent called");
	});
	throttledSubmitEvent.subscribe(() => {
		console.log("throttledSubmitEvent called");
	});

	debouncedSubmitEvent.trigger(submitted);
	throttledSubmitEvent.trigger(submitted);
	logEffectRunner.trigger(submitted);

	resetEvent.subscribe(() => {
		demoFormModule.reset();
		logEffectRunner.stop();
	});

	return {
		changeFirstName,
		changeSecondName,
		submitted,
		resetEvent,
		firstNameState,
		secondNameState,
		symbolsCountState,
		ageState,
		changeAge,
	};
};

export { createStore };
