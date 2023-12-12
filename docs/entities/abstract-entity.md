# AbstractEntity

The base entity.
You cannot create an instance of it, but every entity in `svitore` inherits its behavior

## subscribe

Subscribe to entity

**Interface:**

```ts
subscribe(subscriber: (data: T) => void): () => void
```

## unsubscribe

Unsubscribe from entity

**Interface:**

```ts
unsubscribe(subscriber: ((data: T) => void) | Entity<any>): void
```

## release

Remove all subscribers

**Interface:**

```ts
release(): void
```
