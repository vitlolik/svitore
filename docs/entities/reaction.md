# Reaction

Entity to react to a change in state

_Has the same api as [AbstractState](/entities/abstract-state)_

## constructor

```ts
function constructor(
  states: [
    AbstractState<string>,
    AbstractState<number>,
    ...,
    AbstractState<boolean>
  ]
): Reaction<[
  AbstractState<string>,
  AbstractState<number>,
  ...,
  AbstractState<boolean>,
]>
```

**Example:**

```ts
const $m = new SvitoreModule();

const firstName = $m.State("Tom");
const lastName = $m.State("Cruise");

const firstNameChanged = $m.Event<string>();
const lastNameChanged = $m.Event<string>();

firstName.changeOn(firstNameChanged);
lastName.changeOn(lastNameChanged);

const reaction = $m.Reaction([firstName, lastName]);

reaction.subscribe(([firstName, lastName]) =>
  console.log(`${firstName} ${lastName}`)
);

firstNameChanged.dispatch("Dwayne");
lastNameChanged.dispatch("Johnson"); // log: "Dwayne Johnson", only once
```
