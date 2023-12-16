# AbstractEvent

Entity for state change and much more.

You cannot create an instance of it, but [Event](/entities/event), [DebouncedEvent](/entities/debounced-event) and [ThrottledEvent](/entities/throttled-event) inherits its behavior

_Has the same api as [AbstractEntity](/entities/abstract-entity)_

## dispatch (method)

Notifies listeners with payload

**Interface:**

```ts
function dispatch(payload: T): void;
```

**Example:**

```ts
const $m = new SvitoreModule();

const changeCount = $m.Event<number>();
changeCount.subscribe(console.log);

changeCount.dispatch(10); // log: 10
```

## applyMiddleware (method)

Add middleware

**Interface:**

```ts
type MiddlewareContext<T> = {
  value: T;
};

type Middleware<T> = (context: MiddlewareContext<T>, next: () => void) => void;

function applyMiddleware<E extends Error>(
  middleware: Middleware<T>,
  errorEvent?: AbstractEvent<E>
): AbstractEvent<T>;
```

**Example:**

Common:

```ts
const $m = new SvitoreModule();

const changeCount = $m.Event<number>();

const logMiddleware: Middleware<number> = (context, next) => {
  console.log(context.value);
  next();
};

changeCount.applyMiddleware(logMiddleware);

changeCount.dispatch(10); // log: 10
```

Validation:

```ts
const $m = new SvitoreModule();

const changeCount = $m.Event<number>();
const errorEvent = $m.Event<Error>();

errorEvent.subscribe((error) => console.log(error.message));

const validationMiddleware: Middleware<number> = (context, next) => {
  if (context.value < 11) throw new Error("to small");

  next();
};

changeCount.applyMiddleware(validationMiddleware, errorEvent);

changeCount.dispatch(10); // log: "to small"
```

## on (method)

Set a trigger to trigger the event

**Interface:**

```ts
function on<EntityPayload extends T>(entity: Entity<EntityPayload>): this;
```

```ts
function on<EntityPayload>(
  entity: Entity<EntityPayload>,
  selector: (payload: EntityPayload) => T
): this;
```

**Example:**

Common:

```ts
const $m = new SvitoreModule();

const changeCount = $m.Event<number>();
const trigger = $m.Event<number>();

changeCount.subscribe(console.log);
changeCount.on(trigger);

trigger.dispatch(10); // log: 10
```

Advanced:

```ts
const $m = new SvitoreModule();

const changeCount = $m.Event<number>();
const trigger = $m.Event<string>();

changeCount.subscribe(console.log);
changeCount.on(trigger, (payload) => Number(payload));

trigger.dispatch("10"); // log: 10
```
