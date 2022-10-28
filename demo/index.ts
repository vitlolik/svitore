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
		store.submitted.fire();
	});
	fistNameInput.addEventListener("input", (event) => {
		store.changedFirstName.fire((event.target as HTMLInputElement).value);
	});
	secondNameInput.addEventListener("input", (event) => {
		store.changedSecondName.fire((event.target as HTMLInputElement).value);
	});
	resetButton.addEventListener("click", () => {
		store.resetEvent.fire();
	});

	store.$firstName.subscribe((value) => {
		fistNameInput.value = value;
	});
	store.$secondName.subscribe((value) => {
		secondNameInput.value = value;
	});
	store.$symbolsCount.subscribe((value) => {
		symbolsCount.textContent = value.toString();
	});

	fistNameInput.value = store.$firstName.get();
	secondNameInput.value = store.$secondName.get();
	symbolsCount.textContent = store.$symbolsCount.get().toString();
};

main();
