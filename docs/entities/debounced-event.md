# DebouncedEvent

Debounced event

_Has the same api as [AbstractEvent](/entities/abstract-event)_

## constructor

```ts
function constructor(timeout: number): DebouncedEvent<T>;
```

**Example:**

```ts
const $m = new SvitoreModule();

const changeCount = $m.DebouncedEvent<number>(300);
changeCount.subscribe(console.log);

changeCount.dispatch(10); // not logged
changeCount.dispatch(10); // not logged
changeCount.dispatch(10); // log: 10 (only the last call will work, because of timeout 300ms)
```
