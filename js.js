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

const mascotPhrases = [
  "Tip rapido: tus mejores proyectos deben estar arriba.",
  "Un README claro tambien vende tu trabajo.",
  "Si algo se rompe, mira primero la consola.",
  "Pequenos commits, menos drama.",
  "Ese boton podria tener un estado hover.",
  "El codigo tambien necesita respirar.",
  "Prueba el sitio en movil antes de publicarlo.",
];

let mascotPhraseIndex = 0;
let mascotSpeechTimer;

function setMascotPosition() {
  if (!mascot) return;

  const mascotWidth = mascot.offsetWidth || 128;
  const mascotHeight = mascot.offsetHeight || 150;
  const padding = 18;
  const maxX = Math.max(padding, window.innerWidth - mascotWidth - padding);
  const maxY = Math.max(84, window.innerHeight - mascotHeight - padding);
  const x = Math.round(padding + Math.random() * (maxX - padding));
  const y = Math.round(84 + Math.random() * (maxY - 84));

  mascot.style.setProperty("--mascot-x", `${x}px`);
  mascot.style.setProperty("--mascot-y", `${y}px`);
  mascot.classList.add("is-walking");
  window.setTimeout(() => mascot.classList.remove("is-walking"), 3400);
}

function speakMascot(customPhrase) {
  if (!mascot || !mascotBubble) return;

  const phrase = customPhrase || mascotPhrases[mascotPhraseIndex];
  mascotPhraseIndex = (mascotPhraseIndex + 1) % mascotPhrases.length;
  mascotBubble.textContent = phrase;
  mascot.classList.add("is-speaking");
  window.clearTimeout(mascotSpeechTimer);
  mascotSpeechTimer = window.setTimeout(() => {
    mascot.classList.remove("is-speaking");
  }, 4200);
}

if (mascot) {
  setMascotPosition();
  window.setInterval(setMascotPosition, 7000);
  window.setInterval(() => speakMascot(), 11000);
  window.addEventListener("resize", setMascotPosition);
}

if (mascotButton) {
  mascotButton.addEventListener("click", () => {
    speakMascot("Hola, soy el ayudante del portafolio.");
    setMascotPosition();
  });
}
