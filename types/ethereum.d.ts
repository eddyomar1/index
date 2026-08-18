export interface Eip1193RequestArguments {
  method: string;
  params?: readonly unknown[] | Record<string, unknown>;
}

export interface Eip1193EventMap {
  accountsChanged: readonly string[];
  chainChanged: string;
}

export interface Eip1193Provider {
  request<TResponse = unknown>(args: Eip1193RequestArguments): Promise<TResponse>;
  on?<TEvent extends keyof Eip1193EventMap>(
    event: TEvent,
    listener: (payload: Eip1193EventMap[TEvent]) => void,
  ): void;
  removeListener?<TEvent extends keyof Eip1193EventMap>(
    event: TEvent,
    listener: (payload: Eip1193EventMap[TEvent]) => void,
  ): void;
  providers?: readonly Eip1193Provider[];
  isBraveWallet?: boolean;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isRabby?: boolean;
  isOkxWallet?: boolean;
  isOKExWallet?: boolean;
  isTrust?: boolean;
}

export interface Eip6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface Eip6963ProviderDetail {
  info: Eip6963ProviderInfo;
  provider: Eip1193Provider;
}

export type Eip6963AnnounceProviderEvent = CustomEvent<Eip6963ProviderDetail>;

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
    braveEthereum?: Eip1193Provider;
  }

  interface WindowEventMap {
    'eip6963:announceProvider': Eip6963AnnounceProviderEvent;
    'eip6963:requestProvider': Event;
  }
}
