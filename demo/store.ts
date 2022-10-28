import { Effect, Event, State } from "../src";
import { merge, reset } from "../src/operators";

const createStore = () => {
	const changedFirstName = new Event<string>();
	const changedSecondName = new Event<string>();
	const submitted = new Event();
	const resetEvent = new Event();

	const submitEffect = new Effect(
		(data: { firstName: string; secondName: string; symbolsCount: number }) =>
			new Promise<void>((resolve) => {
				alert(JSON.stringify(data, null, 2));
				resolve();
			})
	);

	const $firstName = new State("").on(changedFirstName);
	const $secondName = new State("").on(changedSecondName);

	const $symbolsCount = merge(
		[$firstName, $secondName],
		(firstName, secondName) => firstName.length + secondName.length
	);

	submitted.direct({
		data: [$firstName, $secondName, $symbolsCount],
		map: (firstName, secondName, symbolsCount) => ({
			firstName,
			secondName,
			symbolsCount,
		}),
		target: submitEffect,
	});

	reset({ trigger: resetEvent, target: [$firstName, $secondName] });

	return {
		changedFirstName,
		changedSecondName,
		submitted,
		resetEvent,
		$firstName,
		$secondName,
		$symbolsCount,
	};
};

export { createStore };
