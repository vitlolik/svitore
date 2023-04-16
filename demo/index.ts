import { createStore } from "./store";

const main = () => {
	const form = document.getElementById("app") as HTMLFormElement;
	const fistNameInput = document.getElementById(
		"firstName"
	) as HTMLInputElement;
	const secondNameInput = document.getElementById(
		"secondName"
	) as HTMLInputElement;
	const symbolsCount = document.getElementById(
		"symbolsCount"
	) as HTMLSpanElement;
	const resetButton = document.getElementById("reset") as HTMLButtonElement;

	const store = createStore();

	form.addEventListener("submit", (event) => {
		event.preventDefault();
		store.submitted.dispatch();
	});
	fistNameInput.addEventListener("input", (event) => {
		store.changeFirstName.dispatch((event.target as HTMLInputElement).value);
	});
	secondNameInput.addEventListener("input", (event) => {
		store.changeSecondName.dispatch((event.target as HTMLInputElement).value);
	});
	resetButton.addEventListener("click", () => {
		store.resetEvent.dispatch();
	});

	store.firstNameState.subscribe((value) => {
		fistNameInput.value = value;
	});
	store.secondNameState.subscribe((value) => {
		secondNameInput.value = value;
	});
	store.symbolsCountState.subscribe((value) => {
		symbolsCount.textContent = value.toString();
	});

	fistNameInput.value = store.firstNameState.get();
	secondNameInput.value = store.secondNameState.get();
	symbolsCount.textContent = store.symbolsCountState.get().toString();
};

main();
