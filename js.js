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
let mascotMode = "robot";

function moveMascot({ offscreen = false } = {}) {
  if (!mascot) return;

  const mascotWidth = mascot.offsetWidth || 128;
  const mascotHeight = mascot.offsetHeight || 150;
  const padding = 18;
  const headerSpace = 84;
  let minX = padding;
  let maxX = Math.max(padding, window.innerWidth - mascotWidth - padding);
  const maxY = Math.max(headerSpace, window.innerHeight - mascotHeight - padding);
  let x;
  let y;

  if (offscreen && mascotMode === "spider") {
    const exitsLeft = Math.random() > 0.5;
    minX = exitsLeft ? -mascotWidth - 28 : window.innerWidth + 28;
    maxX = minX;
    mascot.classList.add("is-offscreen");
  } else {
    mascot.classList.remove("is-offscreen");
  }

  x = Math.round(minX + Math.random() * (maxX - minX));

  if (mascotMode === "stickman") {
    mascot.style.setProperty("--mascot-x", `${x}px`);
    mascot.style.setProperty("--mascot-floor-gap", "10px");
    mascot.classList.add("is-walking");
    window.setTimeout(() => mascot.classList.remove("is-walking"), 3400);
    return;
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
    mascot.style.setProperty("--mascot-page-y", `${y}px`);
    mascot.style.setProperty("--mascot-y", `${Math.max(headerSpace, y - window.scrollY)}px`);
  } else {
    y = Math.round(headerSpace + Math.random() * (maxY - headerSpace));
    mascot.style.setProperty("--mascot-y", `${y}px`);
  }

  mascot.style.setProperty("--mascot-x", `${x}px`);
  mascot.classList.add("is-walking");
  window.setTimeout(() => mascot.classList.remove("is-walking"), 3400);
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
  mascot.classList.add("is-speaking");
  window.clearTimeout(mascotSpeechTimer);
  mascotSpeechTimer = window.setTimeout(() => {
    mascot.classList.remove("is-speaking");
  }, 4200);
}

function setMascotMode(nextMode) {
  if (!mascot || !["robot", "spider", "stickman"].includes(nextMode)) return;

  mascotMode = nextMode;
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
  speakMascot(modeMessage[nextMode]);
  moveMascot();
}

if (mascot) {
  moveMascot();
  window.setInterval(() => {
    const shouldExit = mascotMode === "spider" && Math.random() > 0.62;
    moveMascot({ offscreen: shouldExit });

    if (shouldExit) {
      window.setTimeout(() => moveMascot(), 3600);
    }
  }, 7000);
  window.setInterval(() => speakMascot(), 11000);
  window.addEventListener("resize", () => moveMascot());
}

if (mascotButton) {
  mascotButton.addEventListener("click", () => {
    const clickPhrase = {
      robot: "Hola, soy el ayudante del portafolio.",
      spider: "Subiendo por el DOM.",
      stickman: "Sigo caminando por el piso.",
    };
    speakMascot(clickPhrase[mascotMode]);
    moveMascot();
  });
}

mascotOptions.forEach((option) => {
  option.addEventListener("click", () => {
    setMascotMode(option.dataset.mascotOption);
  });
});
