import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  Eip1193Provider,
  Eip6963AnnounceProviderEvent,
  Eip6963ProviderInfo,
} from '@/types/ethereum';

interface DetectedWallet {
  id: string;
  name: string;
  rdns: string;
  icon: string;
  provider: Eip1193Provider;
}

type BusyAction = 'connect' | 'sign' | null;

const NETWORK_NAMES: Record<string, string> = {
  '0x1': 'Ethereum Mainnet',
  '0xaa36a7': 'Sepolia',
  '0x89': 'Polygon',
  '0x13881': 'Mumbai',
  '0xa': 'Optimism',
  '0xa4b1': 'Arbitrum One',
  '0x2105': 'Base',
  '0x14a34': 'Base Sepolia',
  '0x38': 'BNB Smart Chain',
};

const NATIVE_SYMBOLS: Record<string, string> = {
  '0x1': 'ETH',
  '0xaa36a7': 'ETH',
  '0x89': 'POL',
  '0x13881': 'MATIC',
  '0xa': 'ETH',
  '0xa4b1': 'ETH',
  '0x2105': 'ETH',
  '0x14a34': 'ETH',
  '0x38': 'BNB',
};

function inferWalletName(provider: Eip1193Provider): string {
  if (provider.isBraveWallet) return 'Brave Wallet';
  if (provider.isMetaMask) return 'MetaMask';
  if (provider.isCoinbaseWallet) return 'Coinbase Wallet';
  if (provider.isRabby) return 'Rabby';
  if (provider.isOkxWallet || provider.isOKExWallet) return 'OKX Wallet';
  if (provider.isTrust) return 'Trust Wallet';
  return 'Injected Wallet';
}

function inferWalletRdns(provider: Eip1193Provider): string {
  if (provider.isBraveWallet) return 'com.brave.wallet';
  if (provider.isMetaMask) return 'io.metamask';
  if (provider.isCoinbaseWallet) return 'com.coinbase.wallet';
  if (provider.isRabby) return 'io.rabby';
  if (provider.isOkxWallet || provider.isOKExWallet) return 'com.okx.wallet';
  if (provider.isTrust) return 'com.trustwallet.app';
  return 'extensión del navegador';
}

function inferWalletId(provider: Eip1193Provider, fallbackId: string): string {
  if (provider.isBraveWallet) return 'brave-wallet';
  if (provider.isCoinbaseWallet) return 'coinbase-wallet';
  if (provider.isRabby) return 'rabby-wallet';
  if (provider.isOkxWallet || provider.isOKExWallet) return 'okx-wallet';
  if (provider.isTrust) return 'trust-wallet';
  if (provider.isMetaMask) return 'metamask';
  return fallbackId;
}

function shortenAddress(address: string): string {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '-';
}

function shortenSignature(signature: string): string {
  return signature ? `${signature.slice(0, 18)}...${signature.slice(-12)}` : '-';
}

function formatNativeBalance(hexBalance: string, chainId: string): string {
  const wei = BigInt(hexBalance || '0x0');
  const divisor = 10n ** 18n;
  const whole = wei / divisor;
  const fraction = (wei % divisor).toString().padStart(18, '0').slice(0, 4);
  const symbol = NATIVE_SYMBOLS[chainId.toLowerCase()] ?? 'unidad nativa';

  return `${whole}.${fraction} ${symbol}`;
}

function formatNetwork(chainId: string): string {
  const knownNetwork = NETWORK_NAMES[chainId.toLowerCase()];
  if (knownNetwork) return knownNetwork;

  const numericChainId = Number.parseInt(chainId, 16);
  return Number.isNaN(numericChainId) ? chainId : `Chain ${numericChainId}`;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message) return message;
  }

  return fallback;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export default function Web3Demo() {
  const [wallets, setWallets] = useState<DetectedWallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState('');
  const [balance, setBalance] = useState('');
  const [signature, setSignature] = useState('');
  const [status, setStatus] = useState('Buscando hot wallets en este navegador...');
  const [busyAction, setBusyAction] = useState<BusyAction>(null);

  const walletsRef = useRef<DetectedWallet[]>([]);
  const selectedProviderRef = useRef<Eip1193Provider | null>(null);
  const accountRef = useRef('');
  const busyRef = useRef(false);
  const mountedRef = useRef(false);
  const requestDiscoveryRef = useRef<() => void>(() => undefined);

  const selectedWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === selectedWalletId) ?? wallets[0] ?? null,
    [selectedWalletId, wallets],
  );
  const selectedProvider = selectedWallet?.provider ?? null;
  const resolvedWalletId = selectedWallet?.id ?? '';

  const resetWalletDetails = useCallback((message = 'Wallet desconectada.') => {
    accountRef.current = '';
    setAccount('');
    setChainId('');
    setBalance('');
    setSignature('');
    setStatus(message);
  }, []);

  const refreshWalletDetails = useCallback(
    async (provider: Eip1193Provider, nextAccount: string) => {
      const [chainResult, balanceResult] = await Promise.all([
        provider.request<unknown>({ method: 'eth_chainId' }),
        provider.request<unknown>({
          method: 'eth_getBalance',
          params: [nextAccount, 'latest'],
        }),
      ]);

      if (typeof chainResult !== 'string' || typeof balanceResult !== 'string') {
        throw new Error('La wallet devolvió datos de red no válidos.');
      }

      if (!mountedRef.current || selectedProviderRef.current !== provider) return;

      const walletName =
        walletsRef.current.find((wallet) => wallet.provider === provider)?.name ?? 'Wallet';

      accountRef.current = nextAccount;
      setAccount(nextAccount);
      setChainId(chainResult);
      setBalance(formatNativeBalance(balanceResult, chainResult));
      setSignature('');
      setStatus(`${walletName} conectada. Puedes firmar un mensaje sin gas.`);
    },
    [],
  );

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const registry: DetectedWallet[] = [];
    let fallbackIndex = 0;

    const publishWallets = () => {
      const nextWallets = [...registry];
      walletsRef.current = nextWallets;
      setWallets(nextWallets);
      setSelectedWalletId((currentId) =>
        currentId && nextWallets.some((wallet) => wallet.id === currentId)
          ? currentId
          : (nextWallets[0]?.id ?? ''),
      );

      if (!accountRef.current && !busyRef.current && nextWallets.length) {
        setStatus('Selecciona una hot wallet y conecta para probar la demo.');
      }
    };

    const registerProvider = (
      provider: Eip1193Provider | undefined,
      info?: Partial<Eip6963ProviderInfo>,
      fallbackId?: string,
    ) => {
      if (!provider || typeof provider.request !== 'function') return;

      const existingWallet = registry.find((wallet) => wallet.provider === provider);
      if (existingWallet) {
        existingWallet.name = info?.name || existingWallet.name;
        existingWallet.rdns = info?.rdns || existingWallet.rdns;
        existingWallet.icon = info?.icon?.startsWith('data:image/')
          ? info.icon
          : existingWallet.icon;
        publishWallets();
        return;
      }

      fallbackIndex += 1;
      const preferredId =
        info?.uuid || inferWalletId(provider, fallbackId || `injected-${fallbackIndex}`);
      let id = preferredId;
      let duplicateIndex = 2;

      while (registry.some((wallet) => wallet.id === id)) {
        id = `${preferredId}-${duplicateIndex}`;
        duplicateIndex += 1;
      }

      registry.push({
        id,
        provider,
        name: info?.name || inferWalletName(provider),
        rdns: info?.rdns || inferWalletRdns(provider),
        icon: info?.icon?.startsWith('data:image/') ? info.icon : '',
      });
      publishWallets();
    };

    const scanLegacyProviders = () => {
      if (window.braveEthereum) {
        registerProvider(window.braveEthereum, {
          name: 'Brave Wallet',
          rdns: 'com.brave.wallet',
        });
      }

      const ethereum = window.ethereum;
      if (ethereum?.providers?.length) {
        ethereum.providers.forEach((provider, index) => {
          registerProvider(provider, undefined, `injected-${index + 1}`);
        });
      } else {
        registerProvider(ethereum, undefined, 'window.ethereum');
      }
    };

    const requestDiscovery = () => {
      window.dispatchEvent(new Event('eip6963:requestProvider'));
      scanLegacyProviders();
    };

    const handleProviderAnnouncement = (event: Eip6963AnnounceProviderEvent) => {
      registerProvider(event.detail?.provider, event.detail?.info);
    };

    requestDiscoveryRef.current = requestDiscovery;
    window.addEventListener('eip6963:announceProvider', handleProviderAnnouncement);

    const scanDelays = [0, 300, 1000, 2200];
    const timers = scanDelays.map((delay, index) =>
      window.setTimeout(() => {
        requestDiscovery();

        if (index === scanDelays.length - 1 && !registry.length && !accountRef.current) {
          setStatus('Instala o activa una hot wallet para probar esta demo.');
        }
      }, delay),
    );

    return () => {
      requestDiscoveryRef.current = () => undefined;
      window.removeEventListener('eip6963:announceProvider', handleProviderAnnouncement);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    selectedProviderRef.current = selectedProvider;
    if (!selectedProvider) return undefined;

    const handleAccountsChanged = (accounts: readonly string[]) => {
      if (selectedProviderRef.current !== selectedProvider) return;

      if (!accounts.length) {
        resetWalletDetails('Wallet desconectada.');
        return;
      }

      void refreshWalletDetails(selectedProvider, accounts[0]).catch((error: unknown) => {
        if (selectedProviderRef.current !== selectedProvider) return;
        setStatus(getErrorMessage(error, 'No se pudieron actualizar los datos de la wallet.'));
      });
    };

    const handleChainChanged = () => {
      if (selectedProviderRef.current !== selectedProvider) return;

      const currentAccount = accountRef.current;
      if (!currentAccount) return;

      void refreshWalletDetails(selectedProvider, currentAccount).catch((error: unknown) => {
        if (selectedProviderRef.current !== selectedProvider) return;
        setStatus(getErrorMessage(error, 'No se pudieron actualizar los datos de la red.'));
      });
    };

    selectedProvider.on?.('accountsChanged', handleAccountsChanged);
    selectedProvider.on?.('chainChanged', handleChainChanged);

    return () => {
      selectedProvider.removeListener?.('accountsChanged', handleAccountsChanged);
      selectedProvider.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [refreshWalletDetails, resetWalletDetails, resolvedWalletId, selectedProvider]);

  const selectWallet = (walletId: string) => {
    if (busyRef.current) return;
    selectedProviderRef.current =
      walletsRef.current.find((wallet) => wallet.id === walletId)?.provider ?? null;
    resetWalletDetails('Wallet seleccionada. Conecta para consultar la red y el balance.');
    setSelectedWalletId(walletId);
  };

  const connectWallet = async () => {
    const provider = selectedProviderRef.current;

    if (!provider) {
      setStatus('Buscando hot wallets en este navegador...');
      requestDiscoveryRef.current();
      window.setTimeout(() => {
        if (mountedRef.current && !walletsRef.current.length) {
          setStatus('No se encontró una hot wallet en este navegador.');
        }
      }, 500);
      return;
    }

    busyRef.current = true;
    setBusyAction('connect');
    setStatus('Esperando confirmación en la wallet...');

    try {
      const accounts = await provider.request<unknown>({ method: 'eth_requestAccounts' });

      if (!isStringArray(accounts) || !accounts[0]) {
        throw new Error('La wallet no devolvió una cuenta disponible.');
      }

      await refreshWalletDetails(provider, accounts[0]);
    } catch (error: unknown) {
      if (mountedRef.current && selectedProviderRef.current === provider) {
        setStatus(getErrorMessage(error, 'La conexión fue cancelada.'));
      }
    } finally {
      busyRef.current = false;
      if (mountedRef.current) setBusyAction(null);
    }
  };

  const signWalletMessage = async () => {
    const provider = selectedProviderRef.current;
    const connectedAccount = accountRef.current;
    if (!provider || !connectedAccount) return;

    const message = `EO Portfolio Web3 demo\nWallet: ${connectedAccount}\nFecha: ${new Date().toISOString()}`;
    busyRef.current = true;
    setBusyAction('sign');
    setStatus('Esperando firma en la wallet...');

    try {
      const result = await provider.request<unknown>({
        method: 'personal_sign',
        params: [message, connectedAccount],
      });

      if (typeof result !== 'string') {
        throw new Error('La wallet no devolvió una firma válida.');
      }

      if (mountedRef.current && selectedProviderRef.current === provider) {
        setSignature(result);
        setStatus('Mensaje firmado correctamente. No se realizó ninguna transacción.');
      }
    } catch (error: unknown) {
      if (mountedRef.current && selectedProviderRef.current === provider) {
        setStatus(getErrorMessage(error, 'La firma fue cancelada.'));
      }
    } finally {
      busyRef.current = false;
      if (mountedRef.current) setBusyAction(null);
    }
  };

  const isConnected = Boolean(account);

  return (
    <div
      className="grid gap-6 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)]"
      role="group"
      aria-label="Consola Web3"
      aria-busy={busyAction !== null}
    >
      <div className="flex flex-col gap-6 rounded-[1.75rem] border border-slate-900/10 bg-[#f7f4ee] p-6 shadow-[0_18px_55px_rgba(16,24,32,0.08)] sm:p-8">
        <div className="flex items-start gap-3">
          <span
            className={`mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ${
              isConnected ? 'bg-teal-600 ring-teal-600/15' : 'bg-red-600 ring-red-600/15'
            }`}
            aria-hidden="true"
          />
          <div>
            <h3 className="text-xl font-black text-slate-950">Wallet</h3>
            <p className="mt-1 leading-6 text-slate-600" role="status" aria-live="polite">
              {status}
            </p>
          </div>
        </div>

        <div className="grid gap-2" role="group" aria-label="Hot wallets detectadas">
          {wallets.length ? (
            wallets.map((wallet) => {
              const isSelected = wallet.id === resolvedWalletId;

              return (
                <button
                  className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${
                    isSelected
                      ? 'border-teal-700/40 bg-teal-50 text-slate-950'
                      : 'border-slate-900/10 bg-white text-slate-800 hover:border-teal-700/30 hover:bg-teal-50/60'
                  }`}
                  key={wallet.id}
                  type="button"
                  aria-pressed={isSelected}
                  disabled={busyAction !== null}
                  onClick={() => selectWallet(wallet.id)}
                >
                  {wallet.icon ? (
                    <img className="h-9 w-9 rounded-xl" src={wallet.icon} alt="" />
                  ) : (
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-950 text-xs font-black text-white"
                      aria-hidden="true"
                    >
                      {wallet.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0">
                    <strong className="block truncate">{wallet.name}</strong>
                    <span className="block truncate text-xs font-semibold text-slate-500">
                      {wallet.rdns}
                    </span>
                  </span>
                </button>
              );
            })
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-900/20 bg-white/70 px-4 py-3 text-sm text-slate-600">
              No hay hot wallets detectadas.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-700 px-5 py-3 font-black text-white transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={busyAction !== null}
            onClick={() => void connectWallet()}
          >
            {busyAction === 'connect'
              ? 'Conectando...'
              : wallets.length
                ? 'Conectar wallet'
                : 'Buscar wallets'}
          </button>
          <button
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-900/15 bg-white px-5 py-3 font-black text-slate-950 transition hover:border-teal-700/30 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={!isConnected || busyAction !== null}
            onClick={() => void signWalletMessage()}
          >
            {busyAction === 'sign' ? 'Firmando...' : 'Firmar mensaje'}
          </button>
        </div>

        <p className="text-sm leading-6 text-slate-500">
          Esta demo no envía transacciones, no solicita gas y nunca pedirá tu frase semilla ni tu
          clave privada.
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-[0_12px_36px_rgba(16,24,32,0.06)]">
          <dt className="text-xs font-black tracking-[0.16em] text-teal-700 uppercase">
            Dirección
          </dt>
          <dd className="mt-3 break-all font-mono font-bold text-slate-950" title={account}>
            {shortenAddress(account)}
          </dd>
        </div>
        <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-[0_12px_36px_rgba(16,24,32,0.06)]">
          <dt className="text-xs font-black tracking-[0.16em] text-teal-700 uppercase">Red</dt>
          <dd className="mt-3 break-words font-mono font-bold text-slate-950">
            {chainId ? formatNetwork(chainId) : '-'}
          </dd>
        </div>
        <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-[0_12px_36px_rgba(16,24,32,0.06)]">
          <dt className="text-xs font-black tracking-[0.16em] text-teal-700 uppercase">Balance</dt>
          <dd className="mt-3 break-words font-mono font-bold text-slate-950">{balance || '-'}</dd>
        </div>
        <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-[0_12px_36px_rgba(16,24,32,0.06)] sm:col-span-2">
          <dt className="text-xs font-black tracking-[0.16em] text-teal-700 uppercase">Firma</dt>
          <dd className="mt-3 break-all font-mono font-bold text-slate-950" title={signature}>
            {shortenSignature(signature)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
