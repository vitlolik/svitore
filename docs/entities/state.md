# State

Entity to store the state

_Has the same api as [AbstractState](/entities/abstract-state)_

## constructor

```ts
function constructor(state: T): State<T>;
```

## changeOn (method)

Method to change the state using an event

**Interface:**

```ts
function changeOn<Payload extends T>(event: Event<Payload>): this;
```

```ts
function changeOn<Payload>(
  event: Event<Payload>,
  selector: (payload: Payload, state: T, prevState: T) => T
): this;
```

**Example:**

```ts
const $m = new SvitoreModule();

const counter = $m.State(0);
const counterChanged = $m.Event<number>();

counter.changeOn(counterChanged);
```

You can use in several ways

if the event type matches the state type - short form:

```ts
counter.changeOn(counterChanged);
```

if you want to transform the value

```ts
counter.changeOn(counterChanged, (payload) => payload * 10);
```

if you want to calculate a value based on the state

```ts
counter.changeOn(counterChanged, (payload, state) => state + payload);
```

## resetOn (method)

Reset state to default value

**Interface:**

```ts
function resetOn(event: Event<any>): this;
```

**Example:**

```ts
const $m = new SvitoreModule();

const counter = $m.State(5);
const counterChanged = $m.Event<number>();
const reset = $m.Event();

counter.changeOn(counterChanged).resetOn(reset);

counterChanged.dispatch(10);

reset.dispatch();

counter.get(); // 5
```
