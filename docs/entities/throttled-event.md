# ThrottledEvent

Throttled event

_Has the same api as [AbstractEvent](/entities/abstract-event)_

## constructor

```ts
function constructor(timeout: number): ThrottledEvent<T>;
```

**Example:**

```ts
const $m = new SvitoreModule();

const changeCount = $m.ThrottledEvent<number>(300);
changeCount.subscribe(console.log);

changeCount.dispatch(10); // log: 10
changeCount.dispatch(10); // not logged

await wait(301);

changeCount.dispatch(10); // log: 10 (because 300ms passed between calls)
```
