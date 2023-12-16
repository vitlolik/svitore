# AbstractState

Entity to store the state.

You cannot create an instance of it, but [State](/entities/state), [PersistState](/entities/persist-state) and [ComputedState](/entities/computed-state) inherits its behavior

_Has the same api as [AbstractEntity](/entities/abstract-entity)_

## get (method)

Return current state

**Interface:**

```ts
function get(): T;
```

**Example:**

```ts
const $m = new SvitoreModule();

const counter = $m.State(0);

counter.get(); // 0
```

## getPrev (method)

Return prev state

**Interface:**

```ts
function getPrev(): T;
```

**Example:**

```ts
const $m = new SvitoreModule();

const counter = $m.State(0);
const counterChanged = $m.Event<number>();

counter.changeOn(counterChanged);

counterChanged.dispatch(10);

counter.getPrev(); // 0
counter.get(); // 10
```
