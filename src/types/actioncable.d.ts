declare module '@rails/actioncable' {
  export interface Consumer {
    subscriptions: Subscriptions;
    disconnect(): void;
    connect(): void;
  }

  export interface Subscriptions {
    create<T = unknown>(
      channel: string | ChannelNameWithParams,
      mixin?: CreateMixin<T>
    ): Subscription<T>;
  }

  export interface ChannelNameWithParams {
    channel: string;
    [key: string]: string | undefined;
  }

  export interface CreateMixin<T = unknown> {
    connected?(): void;
    disconnected?(): void;
    received?(data: T): void;
    rejected?(): void;
  }

  export interface Subscription<T = unknown> {
    perform(action: string, data?: object): void;
    send(data: object): boolean;
    unsubscribe(): void;
  }

  export function createConsumer(url?: string): Consumer;
  export function getConfig(name: string): string | undefined;
}
