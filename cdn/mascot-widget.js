(function () {
  const DEFAULT_PHRASES = [
    "Tip rapido: tus mejores proyectos deben estar arriba.",
    "Un README claro tambien vende tu trabajo.",
    "Si algo se rompe, mira primero la consola.",
    "Pequenos commits, menos drama.",
    "Prueba el sitio en movil antes de publicarlo.",
  ];

  const SPIDER_PHRASES = [
    "Voy a revisar los bordes de la pagina.",
    "A veces desaparezco, pero vuelvo con ideas.",
    "La web tambien tiene rincones interesantes.",
    "No olvides probar enlaces antes de publicar.",
  ];

  const STICKMAN_PHRASES = [
    "Camino por el borde como si fuera el piso.",
    "Voy patrullando la pagina.",
    "Este suelo esta bastante estable.",
    "Tambien puedo guiar al usuario sin estorbar.",
  ];

  function createMascot() {
    const mascot = document.createElement("aside");
    mascot.className = "eo-mascot eo-mascot-robot";
    mascot.setAttribute("aria-live", "polite");
    mascot.innerHTML = `
      <div class="eo-mascot-bubble" data-eo-mascot-bubble></div>
      <button class="eo-mascot-character" type="button" aria-label="Mascota del sitio">
        <span class="eo-robot" aria-hidden="true">
          <span class="eo-robot-antenna"></span>
          <span class="eo-robot-head">
            <span class="eo-robot-eye"></span>
            <span class="eo-robot-eye"></span>
          </span>
          <span class="eo-robot-body">
            <span class="eo-robot-code">&lt;/&gt;</span>
          </span>
        </span>
        <span class="eo-spider" aria-hidden="true">
          <span class="eo-spider-leg eo-leg-1"></span>
          <span class="eo-spider-leg eo-leg-2"></span>
          <span class="eo-spider-leg eo-leg-3"></span>
          <span class="eo-spider-leg eo-leg-4"></span>
          <span class="eo-spider-leg eo-leg-5"></span>
          <span class="eo-spider-leg eo-leg-6"></span>
          <span class="eo-spider-leg eo-leg-7"></span>
          <span class="eo-spider-leg eo-leg-8"></span>
          <span class="eo-spider-body">
            <span class="eo-spider-eye"></span>
            <span class="eo-spider-eye"></span>
          </span>
        </span>
        <span class="eo-stickman" aria-hidden="true">
          <span class="eo-stickman-head"></span>
          <span class="eo-stickman-body"></span>
          <span class="eo-stickman-arm eo-arm-left"></span>
          <span class="eo-stickman-arm eo-arm-right"></span>
          <span class="eo-stickman-leg eo-stick-leg-left"></span>
          <span class="eo-stickman-leg eo-stick-leg-right"></span>
          <span class="eo-stickman-shadow"></span>
        </span>
      </button>
    `;
    document.body.appendChild(mascot);
    return mascot;
  }

  function createPicker(target, activeVariant) {
    const picker = document.createElement("div");
    picker.className = "eo-mascot-picker";
    picker.setAttribute("aria-label", "Elegir mascota");
    picker.innerHTML = `
      <button class="eo-mascot-option" type="button" data-eo-mascot-option="robot" aria-label="Usar mascota robot">
        <span class="eo-picker-robot" aria-hidden="true"></span>
      </button>
      <button class="eo-mascot-option" type="button" data-eo-mascot-option="spider" aria-label="Usar mascota arana">
        <span class="eo-picker-spider" aria-hidden="true"></span>
      </button>
      <button class="eo-mascot-option" type="button" data-eo-mascot-option="stickman" aria-label="Usar mascota stickman">
        <span class="eo-picker-stickman" aria-hidden="true"></span>
      </button>
    `;
    target.appendChild(picker);
    setPickerState(picker, activeVariant);
    return picker;
  }

  function setPickerState(picker, variant) {
    if (!picker) return;

    picker.querySelectorAll("[data-eo-mascot-option]").forEach((button) => {
      const isActive = button.dataset.eoMascotOption === variant;
      button.classList.toggle("eo-is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function init(options = {}) {
    const mascot = options.element || createMascot();
    const character = mascot.querySelector(".eo-mascot-character");
    const bubble = mascot.querySelector("[data-eo-mascot-bubble]");
    const phrases = options.phrases || DEFAULT_PHRASES;
    const spiderPhrases = options.spiderPhrases || SPIDER_PHRASES;
    const stickmanPhrases = options.stickmanPhrases || STICKMAN_PHRASES;
    const moveMs = options.moveMs || 7000;
    const speakMs = options.speakMs || 11000;
    let phraseIndex = 0;
    let spiderPhraseIndex = 0;
    let stickmanPhraseIndex = 0;
    let speechTimer;
    let variant = ["robot", "spider", "stickman"].includes(options.variant) ? options.variant : "robot";
    let picker = null;

    if (options.pickerTarget) {
      picker = createPicker(options.pickerTarget, variant);
    }

    function move({ offscreen = false } = {}) {
      const mascotWidth = mascot.offsetWidth || 128;
      const mascotHeight = mascot.offsetHeight || 150;
      const padding = 18;
      const headerSpace = options.headerSpace || 84;
      let minX = padding;
      let maxX = Math.max(padding, window.innerWidth - mascotWidth - padding);
      let x;
      let y;

      if (offscreen && variant === "spider") {
        const exitsLeft = Math.random() > 0.5;
        minX = exitsLeft ? -mascotWidth - 28 : window.innerWidth + 28;
        maxX = minX;
      }

      x = Math.round(minX + Math.random() * (maxX - minX));

      if (variant === "stickman") {
        mascot.style.setProperty("--eo-mascot-x", `${x}px`);
        mascot.style.setProperty("--eo-mascot-floor-gap", "10px");
        mascot.classList.add("eo-is-walking");
        window.setTimeout(() => mascot.classList.remove("eo-is-walking"), 3400);
        return;
      }

      if (variant === "spider") {
        const documentHeight = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          window.innerHeight
        );
        const visibleTop = window.scrollY + headerSpace;
        const visibleBottom = Math.min(
          window.scrollY + window.innerHeight - mascotHeight - padding,
          documentHeight - mascotHeight - padding
        );
        const canUseViewport = visibleBottom > visibleTop;
        const shouldVisitCurrentSection = Math.random() > 0.35;
        const minPageY = shouldVisitCurrentSection && canUseViewport ? visibleTop : headerSpace;
        const maxPageY = shouldVisitCurrentSection && canUseViewport
          ? visibleBottom
          : Math.max(headerSpace, documentHeight - mascotHeight - padding);

        y = Math.round(minPageY + Math.random() * (maxPageY - minPageY));
        mascot.style.setProperty("--eo-mascot-page-y", `${y}px`);
        mascot.style.setProperty("--eo-mascot-y", `${Math.max(headerSpace, y - window.scrollY)}px`);
      } else {
        const maxY = Math.max(headerSpace, window.innerHeight - mascotHeight - padding);
        y = Math.round(headerSpace + Math.random() * (maxY - headerSpace));
        mascot.style.setProperty("--eo-mascot-y", `${y}px`);
      }

      mascot.style.setProperty("--eo-mascot-x", `${x}px`);
      mascot.classList.add("eo-is-walking");
      window.setTimeout(() => mascot.classList.remove("eo-is-walking"), 3400);
    }

    function speak(customPhrase) {
      let phrase = customPhrase;

      if (!phrase && variant === "spider") {
        phrase = spiderPhrases[spiderPhraseIndex];
        spiderPhraseIndex = (spiderPhraseIndex + 1) % spiderPhrases.length;
      }

      if (!phrase && variant === "stickman") {
        phrase = stickmanPhrases[stickmanPhraseIndex];
        stickmanPhraseIndex = (stickmanPhraseIndex + 1) % stickmanPhrases.length;
      }

      if (!phrase) {
        phrase = phrases[phraseIndex];
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }

      bubble.textContent = phrase;
      mascot.classList.add("eo-is-speaking");
      window.clearTimeout(speechTimer);
      speechTimer = window.setTimeout(() => {
        mascot.classList.remove("eo-is-speaking");
      }, 4200);
    }

    function setVariant(nextVariant) {
      variant = ["robot", "spider", "stickman"].includes(nextVariant) ? nextVariant : "robot";
      mascot.classList.toggle("eo-mascot-robot", variant === "robot");
      mascot.classList.toggle("eo-mascot-spider", variant === "spider");
      mascot.classList.toggle("eo-mascot-stickman", variant === "stickman");
      setPickerState(picker, variant);
      const modeMessage = {
        robot: "Modo robot activado.",
        spider: "Modo arana activado.",
        stickman: "Modo stickman activado.",
      };
      speak(modeMessage[variant]);
      move();
    }

    if (character) {
      character.addEventListener("click", () => {
        const clickPhrase = {
          robot: "Hola, soy el ayudante del portafolio.",
          spider: "Subiendo por el DOM.",
          stickman: "Sigo caminando por el piso.",
        };
        speak(clickPhrase[variant]);
        move();
      });
    }

    if (picker) {
      picker.addEventListener("click", (event) => {
        const button = event.target.closest("[data-eo-mascot-option]");
        if (button) setVariant(button.dataset.eoMascotOption);
      });
    }

    setVariant(variant);
    window.setInterval(() => {
      const shouldExit = variant === "spider" && Math.random() > 0.62;
      move({ offscreen: shouldExit });
      if (shouldExit) window.setTimeout(() => move(), 3600);
    }, moveMs);
    window.setInterval(() => speak(), speakMs);
    window.addEventListener("resize", () => move());

    return {
      element: mascot,
      move,
      speak,
      setVariant,
    };
  }

  window.PortfolioMascot = { init };

  document.addEventListener("DOMContentLoaded", () => {
    const autoTarget = document.querySelector("[data-eo-mascot-auto]");
    if (!autoTarget) return;

    init({
      variant: autoTarget.dataset.eoMascotVariant,
      pickerTarget: document.querySelector(autoTarget.dataset.eoMascotPicker || ""),
    });
  });
})();
