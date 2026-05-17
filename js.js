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
let mascotMode = "robot";
let robotCycleId = 0;
const mascotModes = ["robot", "spider", "stickman"];
const minMascotMoveDelay = 60 * 1000;
const maxMascotMoveDelay = 5 * 60 * 1000;
const robotReturnDelay = 60 * 1000;

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
    const strideDistance = 30;
    const stepDurationMs = 550;
    const distance = Math.abs(x - currentX);
    const walkDurationMs = Math.min(6500, Math.max(900, (distance / strideDistance) * stepDurationMs));
    const directionClass = x < currentX ? "is-walking-left" : "is-walking-right";

    mascot.style.setProperty("--mascot-page-y", `${pageY}px`);
    mascot.style.setProperty("--mascot-move-duration", `${walkDurationMs}ms`);
    mascot.style.setProperty("--stickman-step-duration", `${stepDurationMs}ms`);
    mascot.style.setProperty("--mascot-x", `${x}px`);
    mascot.classList.remove("is-walking-left", "is-walking-right");
    mascot.classList.add("is-walking", directionClass);
    window.setTimeout(() => {
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
