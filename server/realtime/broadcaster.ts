export type Subscriber<T> = (payload: T) => void;

export class Broadcaster<T> {
  private subscribers = new Set<Subscriber<T>>();

  subscribe(subscriber: Subscriber<T>) {
    this.subscribers.add(subscriber);
    return () => this.subscribers.delete(subscriber);
  }

  publish(payload: T) {
    this.subscribers.forEach((subscriber) => subscriber(payload));
  }
}
