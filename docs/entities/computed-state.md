# ComputedState

Entity for derived state

_Has the same api as [AbstractState](/entities/abstract-state)_

## constructor

```ts
function constructor(
  states: [
    AbstractState<string>,
    AbstractState<number>,
    ...,
    AbstractState<boolean>
  ],
  selector: (v1: string, v2: number, ..., vn: boolean) => T
): ComputedState<[
  AbstractState<string>,
  AbstractState<number>,
  ...,
  AbstractState<boolean>,
], T>
```

**Example:**

```ts
const $m = new SvitoreModule();

const firstName = $m.State("Tom");
const lastName = $m.State("Cruise");

const fullName = $m.ComputedState(
  [firstName, lastName],
  (firstName, lastName) => `${firstName} ${lastName}`.toUpperCase()
);

fullName.get(); // TOM CRUISE
```
