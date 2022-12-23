export class EventEmitter {
  private listenerMap: { [eventType: string]: EventListener[] };

  public constructor() {
    this.listenerMap = {};
  }

  public on(
    eventType: string,
    callback: ((event: Event) => void),
    option: { once: boolean } = { once: false },
  ): this {
    const listener = {
      callback,
      once: option.once,
    };

    this.getListeners[eventType].push(listener);

    return this;
  }

  public once(
    eventType: string,
    callback: ((event: Event) => void),
  ): this {
    const listener = {
      callback,
      once: true,
    };

    this.getListeners[eventType].push(listener);

    return this;
  }

  public off(
    eventType: string,
    callback?: ((event: Event) => void),
  ): this {
    if (callback == null) {
      this.listenerMap[eventType] = [];
    } else {
      const listeners = this.getListeners(eventType);
      const filtered = listeners.filter(listener => listener.callback !== callback);
      this.listenerMap[eventType] = filtered;
    }

    return this;
  }

  public emit(event: Event): this {
    const listeners = this.getListeners(event.type);

    for (const listener of listeners) {
      listener.callback(event);
    }

    const filtered = listeners.filter(({ once }) => !once);
    this.listenerMap[event.type] = filtered;

    return this;
  }

  private getListeners (eventType: string): EventListener[] {
    if (this.listenerMap[eventType] == null) {
      this.listenerMap[eventType] = [];
    }

    return this.listenerMap[eventType];
  }
}

export interface EventListener {
  callback: (event: Event) => void;
  once: boolean;
}
