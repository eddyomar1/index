(function () {
  const ROBOT_PHRASES = [
    "Tip rapido: tus mejores proyectos deben estar arriba.",
    "Un README claro tambien presenta tu trabajo.",
    "Si algo se rompe, mira primero la consola.",
    "Pequenos commits, menos drama.",
    "Prueba el sitio en movil antes de publicarlo.",
  ];

  const SPIDER_PHRASES = [
    "Voy a revisar los bordes de la pagina.",
    "A veces desaparezco, pero vuelvo con ideas.",
    "La web tambien tiene rincones interesantes.",
    "No olvides probar los enlaces antes de publicar.",
  ];

  const VARIANTS = ["robot", "spider"];

  function createMascot() {
    const mascot = document.createElement("aside");
    mascot.className = "eo-mascot eo-is-inactive";
    mascot.setAttribute("aria-live", "polite");
    mascot.setAttribute("aria-hidden", "true");
    mascot.innerHTML = `
      <div class="eo-mascot-bubble" data-eo-mascot-bubble></div>
      <button class="eo-mascot-character" type="button" aria-label="Interactuar con la mascota">
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
      </button>
    `;
    document.body.appendChild(mascot);
    return mascot;
  }

  function createPicker(target) {
    const picker = document.createElement("div");
    picker.className = "eo-mascot-picker";
    picker.setAttribute("aria-label", "Elegir mascota");
    picker.innerHTML = `
      <button class="eo-mascot-option" type="button" data-eo-mascot-option="robot" aria-label="Usar mascota robot" aria-pressed="false">
        <span class="eo-picker-robot" aria-hidden="true"></span>
      </button>
      <button class="eo-mascot-option" type="button" data-eo-mascot-option="spider" aria-label="Usar mascota arana" aria-pressed="false">
        <span class="eo-picker-spider" aria-hidden="true"></span>
      </button>
    `;
    target.appendChild(picker);
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
    const phrases = {
      robot: options.phrases || ROBOT_PHRASES,
      spider: options.spiderPhrases || SPIDER_PHRASES,
    };
    const phraseIndexes = { robot: 0, spider: 0 };
    const minMoveMs = options.minMoveMs || 60 * 1000;
    const maxMoveMs = options.maxMoveMs || 5 * 60 * 1000;
    const robotReturnMs = options.robotReturnMs || 60 * 1000;
    let variant = null;
    let picker = null;
    let speechTimer;
    let flowTimers = [];

    if (options.pickerTarget) picker = createPicker(options.pickerTarget);

    function queue(callback, delay) {
      const timer = window.setTimeout(callback, delay);
      flowTimers.push(timer);
      return timer;
    }

    function clearFlow() {
      flowTimers.forEach((timer) => window.clearTimeout(timer));
      flowTimers = [];
      mascot.classList.remove("eo-is-walking");
    }

    function getRandomMoveDelay() {
      return Math.round(minMoveMs + Math.random() * (maxMoveMs - minMoveMs));
    }

    function setOffscreenStart() {
      if (!variant) return;

      const mascotWidth = mascot.offsetWidth || 128;
      const mascotHeight = mascot.offsetHeight || 150;
      const headerSpace = options.headerSpace || 84;
      const exitsLeft = Math.random() > 0.5;
      const x = exitsLeft ? -mascotWidth - 28 : window.innerWidth + 28;
      const viewportY = Math.round(
        headerSpace +
          20 +
          Math.random() * Math.max(0, window.innerHeight - mascotHeight - headerSpace - 38),
      );

      mascot.style.setProperty("--eo-mascot-move-duration", "0ms");
      mascot.style.setProperty("--eo-mascot-x", `${x}px`);
      mascot.style.setProperty("--eo-mascot-y", `${viewportY}px`);
      mascot.style.setProperty("--eo-mascot-page-y", `${window.scrollY + viewportY}px`);
      mascot.classList.add("eo-is-offscreen");
      mascot.classList.remove("eo-is-speaking");
      mascot.getBoundingClientRect();
    }

    function move({ offscreen = false, duration = 3400 } = {}) {
      if (!variant) return 0;

      const mascotWidth = mascot.offsetWidth || 128;
      const mascotHeight = mascot.offsetHeight || 150;
      const padding = 18;
      const headerSpace = options.headerSpace || 84;
      let x;

      if (offscreen) {
        x = Math.random() > 0.5 ? -mascotWidth - 28 : window.innerWidth + 28;
        mascot.classList.add("eo-is-offscreen");
      } else {
        const maxX = Math.max(padding, window.innerWidth - mascotWidth - padding);
        x = Math.round(padding + Math.random() * (maxX - padding));
        mascot.classList.remove("eo-is-offscreen");
      }

      mascot.style.setProperty("--eo-mascot-move-duration", `${duration}ms`);
      mascot.style.setProperty("--eo-mascot-x", `${x}px`);

      if (variant === "spider") {
        const documentHeight = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          window.innerHeight,
        );
        const visibleTop = window.scrollY + headerSpace;
        const visibleBottom = Math.min(
          window.scrollY + window.innerHeight - mascotHeight - padding,
          documentHeight - mascotHeight - padding,
        );
        const minY = Math.min(visibleTop, visibleBottom);
        const maxY = Math.max(visibleTop, visibleBottom);
        const pageY = Math.round(minY + Math.random() * (maxY - minY));
        mascot.style.setProperty("--eo-mascot-page-y", `${pageY}px`);
      } else {
        const maxY = Math.max(headerSpace, window.innerHeight - mascotHeight - padding);
        const viewportY = Math.round(headerSpace + Math.random() * (maxY - headerSpace));
        mascot.style.setProperty("--eo-mascot-y", `${viewportY}px`);
      }

      mascot.classList.add("eo-is-walking");
      queue(() => mascot.classList.remove("eo-is-walking"), duration);
      return duration;
    }

    function updateBubblePosition() {
      mascot.classList.remove(
        "eo-bubble-right",
        "eo-bubble-left",
        "eo-bubble-top",
        "eo-bubble-bottom",
      );

      const rect = mascot.getBoundingClientRect();
      const bubbleWidth = Math.min(260, window.innerWidth - 48);
      const bubbleHeight = 88;
      const gap = 20;

      if (window.innerWidth - rect.right >= bubbleWidth + gap) {
        mascot.classList.add("eo-bubble-right");
      } else if (rect.left >= bubbleWidth + gap) {
        mascot.classList.add("eo-bubble-left");
      } else if (rect.top >= bubbleHeight + gap) {
        mascot.classList.add("eo-bubble-top");
      } else {
        mascot.classList.add("eo-bubble-bottom");
      }
    }

    function speak(customPhrase) {
      if (!variant) return;

      const variantPhrases = phrases[variant];
      const index = phraseIndexes[variant];
      const phrase = customPhrase || variantPhrases[index];

      if (!customPhrase) phraseIndexes[variant] = (index + 1) % variantPhrases.length;

      bubble.textContent = phrase;
      updateBubblePosition();
      mascot.classList.add("eo-is-speaking");
      window.clearTimeout(speechTimer);
      speechTimer = window.setTimeout(() => mascot.classList.remove("eo-is-speaking"), 4200);
    }

    function scheduleMove() {
      if (!variant) return;
      queue(
        variant === "robot" ? runRobotCycle : runSpiderCycle,
        variant === "robot" ? robotReturnMs : getRandomMoveDelay(),
      );
    }

    function finishMove(duration, customPhrase) {
      queue(() => {
        speak(customPhrase);
        scheduleMove();
      }, duration + 250);
    }

    function enterFromEdge(customPhrase) {
      setOffscreenStart();
      queue(() => finishMove(move(), customPhrase), 60);
    }

    function runRobotCycle() {
      if (variant !== "robot") return;
      clearFlow();
      const exitDuration = move({ offscreen: true });
      queue(() => finishMove(move(), undefined), exitDuration + 1200);
    }

    function runSpiderCycle() {
      if (variant !== "spider") return;
      clearFlow();

      if (Math.random() > 0.62) {
        const exitDuration = move({ offscreen: true });
        queue(() => finishMove(move(), undefined), exitDuration + 1200);
        return;
      }

      finishMove(move(), undefined);
    }

    function setVariant(nextVariant) {
      if (!VARIANTS.includes(nextVariant) || nextVariant === variant) return;

      clearFlow();
      window.clearTimeout(speechTimer);
      mascot.classList.remove("eo-is-speaking");
      variant = nextVariant;
      mascot.classList.remove("eo-is-inactive");
      mascot.classList.toggle("eo-mascot-robot", variant === "robot");
      mascot.classList.toggle("eo-mascot-spider", variant === "spider");
      mascot.setAttribute("aria-hidden", "false");
      setPickerState(picker, variant);
      enterFromEdge(variant === "robot" ? "Modo robot activado." : "Modo arana activado.");
    }

    if (character) {
      character.addEventListener("click", () => {
        if (!variant) return;
        clearFlow();
        window.clearTimeout(speechTimer);
        mascot.classList.remove("eo-is-speaking");
        finishMove(move(), undefined);
      });
    }

    if (picker) {
      picker.addEventListener("click", (event) => {
        const button = event.target.closest("[data-eo-mascot-option]");
        if (button) setVariant(button.dataset.eoMascotOption);
      });
    }

    if (VARIANTS.includes(options.variant)) setVariant(options.variant);

    window.addEventListener("resize", () => {
      if (!variant) return;
      clearFlow();
      if (mascot.classList.contains("eo-is-offscreen")) setOffscreenStart();
      else move({ duration: 500 });
      scheduleMove();
    });

    return { element: mascot, move, speak, setVariant };
  }

  window.PortfolioMascot = { init };

  document.addEventListener("DOMContentLoaded", () => {
    const autoTarget = document.querySelector("[data-eo-mascot-auto]");
    if (!autoTarget) return;

    const pickerSelector = autoTarget.dataset.eoMascotPicker;
    init({
      variant: autoTarget.dataset.eoMascotVariant,
      pickerTarget: pickerSelector ? document.querySelector(pickerSelector) : null,
    });
  });
})();
