import { AbstractEvent } from "./services";

class Event<Payload = void> extends AbstractEvent<Payload> {}

export { Event };
