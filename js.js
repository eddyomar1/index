const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const mascot = document.querySelector(".site-mascot");
const mascotButton = document.querySelector(".mascot-character");
const mascotBubble = document.querySelector("[data-mascot-bubble]");
const mascotOptions = document.querySelectorAll("[data-mascot-option]");
const siteFooter = document.querySelector(".site-footer");
const web3Demo = document.querySelector("[data-web3-demo]");
const walletConnectButton = document.querySelector("[data-wallet-connect]");
const walletSignButton = document.querySelector("[data-wallet-sign]");
const walletList = document.querySelector("[data-wallet-list]");
const walletStatus = document.querySelector("[data-wallet-status]");
const walletDot = document.querySelector("[data-wallet-dot]");
const walletAddress = document.querySelector("[data-wallet-address]");
const walletNetwork = document.querySelector("[data-wallet-network]");
const walletBalance = document.querySelector("[data-wallet-balance]");
const walletSignature = document.querySelector("[data-wallet-signature]");

const mascotPhrases = [
  "Tip rapido: tus mejores proyectos deben estar arriba.",
  "Un README claro tambien vende tu trabajo.",
  "Si algo se rompe, mira primero la consola.",
  "Pequenos commits, menos drama.",
  "Ese boton podria tener un estado hover.",
  "El codigo tambien necesita respirar.",
  "Prueba el sitio en movil antes de publicarlo.",
];

const spiderPhrases = [
  "Voy a revisar los bordes de la pagina.",
  "A veces desaparezco, pero vuelvo con ideas.",
  "La web tambien tiene rincones interesantes.",
  "No olvides probar enlaces antes de publicar.",
];

const stickmanPhrases = [
  "Camino por el borde como si fuera el piso.",
  "Voy patrullando la pagina.",
  "Este suelo esta bastante estable.",
  "Tambien puedo guiar al usuario sin estorbar.",
];

let mascotPhraseIndex = 0;
let spiderPhraseIndex = 0;
let stickmanPhraseIndex = 0;
let mascotSpeechTimer;
let mascotMoveTimer;
let stickmanWalkTimer;
let mascotMode = "robot";
let robotCycleId = 0;
const mascotModes = ["robot", "spider", "stickman"];
const minMascotMoveDelay = 60 * 1000;
const maxMascotMoveDelay = 5 * 60 * 1000;
const robotReturnDelay = 60 * 1000;
const networkNames = {
  "0x1": "Ethereum Mainnet",
  "0xaa36a7": "Sepolia",
  "0x89": "Polygon",
  "0x13881": "Mumbai",
  "0xa": "Optimism",
  "0xa4b1": "Arbitrum One",
  "0x2105": "Base",
  "0x14a34": "Base Sepolia",
  "0x38": "BNB Smart Chain",
};

let connectedWallet = "";
let selectedWalletId = "";
const detectedWallets = [];
const walletEventProviders = new WeakSet();
let walletDiscoveryStarted = false;

function inferWalletName(provider) {
  if (provider?.isBraveWallet) return "Brave Wallet";
  if (provider?.isMetaMask) return "MetaMask";
  if (provider?.isCoinbaseWallet) return "Coinbase Wallet";
  if (provider?.isRabby) return "Rabby";
  if (provider?.isOkxWallet || provider?.isOKExWallet) return "OKX Wallet";
  if (provider?.isTrust) return "Trust Wallet";
  return "Injected Wallet";
}

function inferWalletRdns(provider) {
  if (provider?.isBraveWallet) return "com.brave.wallet";
  if (provider?.isMetaMask) return "io.metamask";
  if (provider?.isCoinbaseWallet) return "com.coinbase.wallet";
  if (provider?.isRabby) return "io.rabby";
  if (provider?.isOkxWallet || provider?.isOKExWallet) return "com.okx.wallet";
  if (provider?.isTrust) return "com.trustwallet.app";
  return "browser extension";
}

function inferWalletId(provider, fallbackId) {
  if (provider?.isBraveWallet) return "brave-wallet";
  if (provider?.isCoinbaseWallet) return "coinbase-wallet";
  if (provider?.isRabby) return "rabby-wallet";
  if (provider?.isOkxWallet || provider?.isOKExWallet) return "okx-wallet";
  if (provider?.isTrust) return "trust-wallet";
  if (provider?.isMetaMask) return "metamask";
  return fallbackId;
}

function syncWalletDiscoveryStatus() {
  if (!detectedWallets.length) {
    setWalletStatus("Instala o activa una hot wallet para probar esta demo.");
    return;
  }

  if (!connectedWallet) {
    setWalletStatus("Selecciona una hot wallet y conecta para probar la demo.");
  }
}

function registerWalletEvents(wallet) {
  if (!wallet?.provider || walletEventProviders.has(wallet.provider)) return;

  walletEventProviders.add(wallet.provider);
  wallet.provider.on?.("accountsChanged", (accounts) => {
    if (getSelectedWallet()?.provider !== wallet.provider) return;

    if (!accounts.length) {
      resetWalletDetails();
      return;
    }

    refreshWalletDetails(accounts[0]).catch(() => {
      setWalletStatus("No se pudieron actualizar los datos de la wallet.");
    });
  });

  wallet.provider.on?.("chainChanged", () => {
    if (getSelectedWallet()?.provider !== wallet.provider || !connectedWallet) return;

    refreshWalletDetails(connectedWallet).catch(() => {
      setWalletStatus("No se pudieron actualizar los datos de la red.", true);
    });
  });
}

function addWalletProvider(wallet, fallbackId = `wallet-${detectedWallets.length + 1}`) {
  if (!wallet?.provider) return;

  const id = wallet.id || wallet.info?.uuid || wallet.info?.rdns || inferWalletId(wallet.provider, fallbackId);
  const existingWallet = detectedWallets.find((item) => item.provider === wallet.provider || item.id === id);
  const normalizedWallet = {
    id,
    provider: wallet.provider,
    name: wallet.info?.name || inferWalletName(wallet.provider),
    rdns: wallet.info?.rdns || inferWalletRdns(wallet.provider),
    icon: wallet.info?.icon || "",
  };

  if (existingWallet) {
    existingWallet.name = normalizedWallet.name;
    existingWallet.rdns = normalizedWallet.rdns;
    existingWallet.icon = normalizedWallet.icon || existingWallet.icon;
    registerWalletEvents(existingWallet);
    renderWalletOptions();
    syncWalletDiscoveryStatus();
    return;
  }

  detectedWallets.push(normalizedWallet);
  registerWalletEvents(normalizedWallet);

  if (!selectedWalletId) selectedWalletId = id;
  renderWalletOptions();
  syncWalletDiscoveryStatus();
}

function scanLegacyWalletProviders() {
  const ethereum = window.ethereum;
  const providers = [];

  if (window.braveEthereum) {
    providers.push({
      id: "brave-wallet",
      info: {
        name: "Brave Wallet",
        rdns: "com.brave.wallet",
      },
      provider: window.braveEthereum,
    });
  }

  if (ethereum?.providers?.length) {
    ethereum.providers.forEach((provider, index) => {
      providers.push({
        id: inferWalletId(provider, `injected-${index}`),
        info: {
          name: inferWalletName(provider),
          rdns: inferWalletRdns(provider),
        },
        provider,
      });
    });
  } else if (ethereum) {
    providers.push({
      id: inferWalletId(ethereum, "window.ethereum"),
      info: {
        name: inferWalletName(ethereum),
        rdns: inferWalletRdns(ethereum),
      },
      provider: ethereum,
    });
  }

  providers.forEach((provider, index) => addWalletProvider(provider, `legacy-${index}`));
}

function requestWalletDiscoveryScan() {
  window.dispatchEvent(new Event("eip6963:requestProvider"));
  scanLegacyWalletProviders();
  renderWalletOptions();
  syncWalletDiscoveryStatus();
}

function discoverInjectedWallets() {
  if (walletDiscoveryStarted) {
    requestWalletDiscoveryScan();
    return;
  }

  walletDiscoveryStarted = true;
  window.addEventListener("eip6963:announceProvider", (event) => {
    addWalletProvider({
      id: event.detail?.info?.uuid,
      info: event.detail?.info,
      provider: event.detail?.provider,
    });
  });

  [0, 300, 1000, 2200].forEach((delay) => {
    window.setTimeout(() => {
      requestWalletDiscoveryScan();
    }, delay);
  });
}

function getSelectedWallet() {
  return detectedWallets.find((wallet) => wallet.id === selectedWalletId) || detectedWallets[0] || null;
}

function shortenAddress(address) {
  if (!address) return "-";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatEthBalance(hexBalance) {
  const wei = BigInt(hexBalance || "0x0");
  const whole = wei / 10n ** 18n;
  const fraction = (wei % 10n ** 18n).toString().padStart(18, "0").slice(0, 4);

  return `${whole}.${fraction} ETH`;
}

function getEthereumProvider() {
  return getSelectedWallet()?.provider || null;
}

function setWalletStatus(message, isConnected = false) {
  if (walletStatus) walletStatus.textContent = message;
  if (walletDot) walletDot.classList.toggle("is-connected", isConnected);
  if (walletSignButton) walletSignButton.disabled = !isConnected;
}

function resetWalletDetails() {
  connectedWallet = "";
  if (walletAddress) walletAddress.textContent = "-";
  if (walletNetwork) walletNetwork.textContent = "-";
  if (walletBalance) walletBalance.textContent = "-";
  if (walletSignature) walletSignature.textContent = "-";
  setWalletStatus("Wallet desconectada.");
}

function renderWalletOptions() {
  if (!walletList) return;

  walletList.textContent = "";

  if (!detectedWallets.length) {
    const empty = document.createElement("p");
    empty.className = "wallet-empty";
    empty.textContent = "No hay hot wallets detectadas.";
    walletList.appendChild(empty);
    return;
  }

  detectedWallets.forEach((wallet) => {
    const button = document.createElement("button");
    const label = document.createElement("span");
    const meta = document.createElement("small");
    button.className = "wallet-option";
    button.type = "button";
    button.dataset.walletId = wallet.id;
    button.classList.toggle("is-selected", wallet.id === selectedWalletId);
    button.setAttribute("aria-pressed", String(wallet.id === selectedWalletId));

    if (wallet.icon) {
      const icon = document.createElement("img");
      icon.className = "wallet-icon";
      icon.src = wallet.icon;
      icon.alt = "";
      button.appendChild(icon);
    } else {
      const fallbackIcon = document.createElement("span");
      fallbackIcon.className = "wallet-fallback-icon";
      fallbackIcon.textContent = wallet.name.slice(0, 2).toUpperCase();
      button.appendChild(fallbackIcon);
    }

    label.textContent = wallet.name;
    meta.textContent = wallet.rdns;
    label.appendChild(meta);
    button.appendChild(label);
    walletList.appendChild(button);
  });
}

function selectWalletProvider(walletId) {
  selectedWalletId = walletId;
  renderWalletOptions();
  resetWalletDetails();
}

async function refreshWalletDetails(account) {
  const provider = getEthereumProvider();
  if (!provider || !account) return;

  const [chainId, balance] = await Promise.all([
    provider.request({ method: "eth_chainId" }),
    provider.request({ method: "eth_getBalance", params: [account, "latest"] }),
  ]);

  connectedWallet = account;
  if (walletAddress) walletAddress.textContent = shortenAddress(account);
  if (walletNetwork) walletNetwork.textContent = networkNames[chainId] || `Chain ${parseInt(chainId, 16)}`;
  if (walletBalance) walletBalance.textContent = formatEthBalance(balance);
  if (walletSignature) walletSignature.textContent = "-";
  setWalletStatus(`${getSelectedWallet()?.name || "Wallet"} conectada. Puedes firmar un mensaje sin gas.`, true);
}

async function connectWallet() {
  discoverInjectedWallets();

  const provider = getEthereumProvider();

  if (!provider) {
    setWalletStatus("No se encontro una hot wallet en este navegador.");
    return;
  }

  try {
    setWalletStatus("Esperando confirmacion en la wallet...");
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    await refreshWalletDetails(accounts[0]);
  } catch (error) {
    setWalletStatus(error?.message || "La conexion fue cancelada.");
  }
}

async function signWalletMessage() {
  const provider = getEthereumProvider();
  if (!provider || !connectedWallet) return;

  const message = `EO Portfolio Web3 demo\nWallet: ${connectedWallet}\nFecha: ${new Date().toISOString()}`;

  try {
    setWalletStatus("Esperando firma en la wallet...", true);
    const signature = await provider.request({
      method: "personal_sign",
      params: [message, connectedWallet],
    });
    if (walletSignature) walletSignature.textContent = `${signature.slice(0, 18)}...${signature.slice(-12)}`;
    setWalletStatus("Mensaje firmado correctamente.", true);
  } catch (error) {
    setWalletStatus(error?.message || "La firma fue cancelada.", true);
  }
}

if (web3Demo) {
  discoverInjectedWallets();

  walletConnectButton?.addEventListener("click", connectWallet);
  walletSignButton?.addEventListener("click", signWalletMessage);
  walletList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-wallet-id]");
    if (button) selectWalletProvider(button.dataset.walletId);
  });
}

function getRandomMascotMoveDelay() {
  return Math.round(minMascotMoveDelay + Math.random() * (maxMascotMoveDelay - minMascotMoveDelay));
}

function getRandomMascotMode() {
  return mascotModes[Math.floor(Math.random() * mascotModes.length)];
}

function setRobotOffscreenStart() {
  if (!mascot) return;

  const mascotWidth = mascot.offsetWidth || 128;
  const exitsLeft = Math.random() > 0.5;
  const x = exitsLeft ? -mascotWidth - 28 : window.innerWidth + 28;
  const y = Math.round(104 + Math.random() * Math.max(0, window.innerHeight - (mascot.offsetHeight || 150) - 122));

  mascot.style.setProperty("--mascot-move-duration", "0ms");
  mascot.style.setProperty("--mascot-x", `${x}px`);
  mascot.style.setProperty("--mascot-y", `${y}px`);
  mascot.classList.add("is-offscreen");
  mascot.classList.remove("is-speaking");
  mascot.getBoundingClientRect();
}

function moveMascot({ offscreen = false } = {}) {
  if (!mascot) return 0;

  const mascotWidth = mascot.offsetWidth || 128;
  const mascotHeight = mascot.offsetHeight || 150;
  const padding = 18;
  const headerSpace = 84;
  let minX = padding;
  let maxX = Math.max(padding, window.innerWidth - mascotWidth - padding);
  const maxY = Math.max(headerSpace, window.innerHeight - mascotHeight - padding);
  let x;
  let y;

  if (offscreen && mascotMode !== "stickman") {
    const exitsLeft = Math.random() > 0.5;
    minX = exitsLeft ? -mascotWidth - 28 : window.innerWidth + 28;
    maxX = minX;
    mascot.classList.add("is-offscreen");
  } else {
    mascot.classList.remove("is-offscreen");
  }

  x = Math.round(minX + Math.random() * (maxX - minX));

  if (mascotMode === "stickman") {
    const currentX = mascot.getBoundingClientRect().left;
    const floorTarget = siteFooter || document.body;
    const floorRect = floorTarget.getBoundingClientRect();
    const floorBottom = window.scrollY + floorRect.top + floorRect.height;
    const pageY = Math.max(headerSpace, Math.round(floorBottom - mascotHeight + 2));
    const strideDistance = 22;
    const stepDurationMs = 620;
    const distance = Math.abs(x - currentX);
    const walkDurationMs = Math.min(9000, Math.max(1100, (distance / strideDistance) * stepDurationMs));
    const directionClass = x < currentX ? "is-walking-left" : "is-walking-right";
    const facingClass = x < currentX ? "is-facing-left" : "is-facing-right";

    mascot.style.setProperty("--mascot-page-y", `${pageY}px`);
    mascot.style.setProperty("--mascot-move-duration", `${walkDurationMs}ms`);
    mascot.style.setProperty("--stickman-step-duration", `${stepDurationMs}ms`);
    mascot.style.setProperty("--stickman-step-delay", `${-stepDurationMs / 2}ms`);
    mascot.style.setProperty("--mascot-x", `${x}px`);
    mascot.classList.remove("is-walking-left", "is-walking-right", "is-facing-left", "is-facing-right");
    mascot.classList.add("is-walking", directionClass, facingClass);
    window.clearTimeout(stickmanWalkTimer);
    stickmanWalkTimer = window.setTimeout(() => {
      mascot.classList.remove("is-walking", "is-walking-left", "is-walking-right");
    }, walkDurationMs);
    return walkDurationMs;
  }

  if (mascotMode === "spider") {
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      window.innerHeight
    );
    const visibleTop = window.scrollY + headerSpace;
    const visibleBottom = Math.min(window.scrollY + window.innerHeight - mascotHeight - padding, documentHeight - mascotHeight - padding);
    const canUseViewport = visibleBottom > visibleTop;
    const shouldVisitCurrentSection = Math.random() > 0.35;
    const minPageY = shouldVisitCurrentSection && canUseViewport ? visibleTop : headerSpace;
    const maxPageY = shouldVisitCurrentSection && canUseViewport
      ? visibleBottom
      : Math.max(headerSpace, documentHeight - mascotHeight - padding);

    y = Math.round(minPageY + Math.random() * (maxPageY - minPageY));
  } else {
    y = Math.round(headerSpace + Math.random() * (maxY - headerSpace));
  }

  mascot.style.setProperty("--mascot-move-duration", "3400ms");
  if (mascotMode === "spider") {
    mascot.style.setProperty("--mascot-page-y", `${y}px`);
    mascot.style.setProperty("--mascot-y", `${Math.max(headerSpace, y - window.scrollY)}px`);
  } else {
    mascot.style.setProperty("--mascot-y", `${y}px`);
  }
  mascot.style.setProperty("--mascot-x", `${x}px`);
  mascot.classList.add("is-walking");
  window.setTimeout(() => mascot.classList.remove("is-walking"), 3400);
  return 3400;
}

function speakMascot(customPhrase) {
  if (!mascot || !mascotBubble) return;

  let phrase = customPhrase;

  if (!phrase && mascotMode === "spider") {
    phrase = spiderPhrases[spiderPhraseIndex];
    spiderPhraseIndex = (spiderPhraseIndex + 1) % spiderPhrases.length;
  }

  if (!phrase && mascotMode === "stickman") {
    phrase = stickmanPhrases[stickmanPhraseIndex];
    stickmanPhraseIndex = (stickmanPhraseIndex + 1) % stickmanPhrases.length;
  }

  if (!phrase) {
    phrase = mascotPhrases[mascotPhraseIndex];
    mascotPhraseIndex = (mascotPhraseIndex + 1) % mascotPhrases.length;
  }

  mascotBubble.textContent = phrase;
  updateMascotBubblePosition();
  mascot.classList.add("is-speaking");
  window.clearTimeout(mascotSpeechTimer);
  mascotSpeechTimer = window.setTimeout(() => {
    mascot.classList.remove("is-speaking");
  }, 4200);
}

function updateMascotBubblePosition() {
  if (!mascot) return;

  mascot.classList.remove("bubble-right", "bubble-left", "bubble-top", "bubble-bottom");

  const rect = mascot.getBoundingClientRect();
  const bubbleWidth = Math.min(260, window.innerWidth - 48);
  const bubbleHeight = 88;
  const gap = 20;
  const spaceRight = window.innerWidth - rect.right;
  const spaceLeft = rect.left;
  const spaceTop = rect.top;
  const spaceBottom = window.innerHeight - rect.bottom;

  if (spaceRight >= bubbleWidth + gap) {
    mascot.classList.add("bubble-right");
  } else if (spaceLeft >= bubbleWidth + gap) {
    mascot.classList.add("bubble-left");
  } else if (spaceTop >= bubbleHeight + gap) {
    mascot.classList.add("bubble-top");
  } else {
    mascot.classList.add(spaceBottom >= bubbleHeight + gap ? "bubble-bottom" : "bubble-top");
  }
}

function setMascotMode(nextMode, { announce = true } = {}) {
  if (!mascot || !mascotModes.includes(nextMode)) return;

  mascotMode = nextMode;
  if (nextMode !== "robot") robotCycleId += 1;
  mascot.classList.toggle("mascot-mode-robot", nextMode === "robot");
  mascot.classList.toggle("mascot-mode-spider", nextMode === "spider");
  mascot.classList.toggle("mascot-mode-stickman", nextMode === "stickman");
  mascotOptions.forEach((option) => {
    const isActive = option.dataset.mascotOption === nextMode;
    option.classList.toggle("is-active", isActive);
    option.setAttribute("aria-pressed", String(isActive));
  });
  const modeMessage = {
    robot: "Modo robot activado.",
    spider: "Modo arana activado.",
    stickman: "Modo stickman activado.",
  };

  if (nextMode === "robot") {
    setRobotOffscreenStart();
    runRobotCycle(announce ? modeMessage.robot : undefined);
    return;
  }

  const duration = moveMascot();
  window.setTimeout(() => speakMascot(announce ? modeMessage[nextMode] : undefined), duration + 250);
  scheduleMascotMove();
}

function runRobotCycle(customPhrase) {
  if (!mascot || mascotMode !== "robot") return;

  const cycleId = robotCycleId + 1;
  robotCycleId = cycleId;
  window.clearTimeout(mascotMoveTimer);
  const enterDuration = moveMascot();
  window.setTimeout(() => {
    if (cycleId !== robotCycleId || mascotMode !== "robot") return;

    speakMascot(customPhrase);
    window.setTimeout(() => {
      if (cycleId !== robotCycleId || mascotMode !== "robot") return;

      const exitDuration = moveMascot({ offscreen: true });
      window.setTimeout(() => {
        if (cycleId === robotCycleId && mascotMode === "robot") scheduleMascotMove();
      }, exitDuration + 250);
    }, 4800);
  }, enterDuration + 250);
}

function runScheduledMascotMove() {
  if (!mascot) return;

  const shouldExit = mascotMode === "spider" && Math.random() > 0.62;

  if (shouldExit) {
    const exitDuration = moveMascot({ offscreen: true });
    window.setTimeout(() => {
      const returnDuration = moveMascot();
      window.setTimeout(() => {
        speakMascot();
        scheduleMascotMove();
      }, returnDuration + 250);
    }, exitDuration + 1200);
    return;
  }

  const duration = moveMascot();
  window.setTimeout(() => {
    speakMascot();
    scheduleMascotMove();
  }, duration + 250);
}

function scheduleMascotMove() {
  window.clearTimeout(mascotMoveTimer);
  mascotMoveTimer = window.setTimeout(
    mascotMode === "robot" ? runRobotCycle : runScheduledMascotMove,
    mascotMode === "robot" ? robotReturnDelay : getRandomMascotMoveDelay()
  );
}

if (mascotButton) {
  mascotButton.addEventListener("click", () => {
    const clickPhrase = {
      robot: "Hola, soy el ayudante del portafolio.",
      spider: "Subiendo por el DOM.",
      stickman: "Sigo caminando por el piso.",
    };

    if (mascotMode === "robot") {
      setRobotOffscreenStart();
      runRobotCycle(clickPhrase.robot);
      return;
    }

    const duration = moveMascot();
    window.setTimeout(() => speakMascot(clickPhrase[mascotMode]), duration + 250);
    scheduleMascotMove();
  });
}

mascotOptions.forEach((option) => {
  option.addEventListener("click", () => {
    setMascotMode(option.dataset.mascotOption);
  });
});

if (mascot) {
  setMascotMode(getRandomMascotMode(), { announce: false });
  window.addEventListener("resize", () => {
    if (mascotMode === "robot" && mascot.classList.contains("is-offscreen")) {
      setRobotOffscreenStart();
      return;
    }

    moveMascot();
  });
}
