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

  const VARIANTS = ["robot", "spider", "stickman"];

  function getRandomVariant() {
    return VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
  }

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
          <span class="eo-stickman-leg eo-stick-leg-left">
            <span class="eo-stickman-knee"></span>
            <span class="eo-stickman-calf">
              <span class="eo-stickman-foot"></span>
            </span>
          </span>
          <span class="eo-stickman-leg eo-stick-leg-right">
            <span class="eo-stickman-knee"></span>
            <span class="eo-stickman-calf">
              <span class="eo-stickman-foot"></span>
            </span>
          </span>
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
    const minMoveMs = options.minMoveMs || 60 * 1000;
    const maxMoveMs = options.maxMoveMs || 5 * 60 * 1000;
    const robotReturnMs = options.robotReturnMs || 60 * 1000;
    let phraseIndex = 0;
    let spiderPhraseIndex = 0;
    let stickmanPhraseIndex = 0;
    let speechTimer;
    let moveTimer;
    let stickmanWalkTimer;
    let variant = VARIANTS.includes(options.variant) ? options.variant : getRandomVariant();
    let robotCycleId = 0;
    let picker = null;

    if (options.pickerTarget) {
      picker = createPicker(options.pickerTarget, variant);
    }

    function getRandomMoveDelay() {
      return Math.round(minMoveMs + Math.random() * (maxMoveMs - minMoveMs));
    }

    function setRobotOffscreenStart() {
      const mascotWidth = mascot.offsetWidth || 128;
      const mascotHeight = mascot.offsetHeight || 150;
      const headerSpace = options.headerSpace || 84;
      const exitsLeft = Math.random() > 0.5;
      const x = exitsLeft ? -mascotWidth - 28 : window.innerWidth + 28;
      const y = Math.round(headerSpace + 20 + Math.random() * Math.max(0, window.innerHeight - mascotHeight - headerSpace - 38));

      mascot.style.setProperty("--eo-mascot-move-duration", "0ms");
      mascot.style.setProperty("--eo-mascot-x", `${x}px`);
      mascot.style.setProperty("--eo-mascot-y", `${y}px`);
      mascot.classList.add("eo-is-offscreen");
      mascot.classList.remove("eo-is-speaking");
      mascot.getBoundingClientRect();
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

      if (offscreen && variant !== "stickman") {
        const exitsLeft = Math.random() > 0.5;
        minX = exitsLeft ? -mascotWidth - 28 : window.innerWidth + 28;
        maxX = minX;
        mascot.classList.add("eo-is-offscreen");
      } else {
        mascot.classList.remove("eo-is-offscreen");
      }

      x = Math.round(minX + Math.random() * (maxX - minX));

      if (variant === "stickman") {
        const currentX = mascot.getBoundingClientRect().left;
        const floorTarget = options.stickmanFloorTarget || document.querySelector("footer") || document.body;
        const floorRect = floorTarget.getBoundingClientRect();
        const floorBottom = window.scrollY + floorRect.top + floorRect.height;
        const pageY = Math.max(headerSpace, Math.round(floorBottom - mascotHeight + 2));
        const strideDistance = options.stickmanStrideDistance || 22;
        const stepDurationMs = options.stickmanStepMs || 620;
        const distance = Math.abs(x - currentX);
        const walkDurationMs = Math.min(9000, Math.max(1100, (distance / strideDistance) * stepDurationMs));
        const directionClass = x < currentX ? "eo-is-walking-left" : "eo-is-walking-right";
        const facingClass = x < currentX ? "eo-is-facing-left" : "eo-is-facing-right";

        mascot.style.setProperty("--eo-mascot-page-y", `${pageY}px`);
        mascot.style.setProperty("--eo-mascot-move-duration", `${walkDurationMs}ms`);
        mascot.style.setProperty("--eo-stickman-step-duration", `${stepDurationMs}ms`);
        mascot.style.setProperty("--eo-stickman-step-delay", `${-stepDurationMs / 2}ms`);
        mascot.style.setProperty("--eo-mascot-x", `${x}px`);
        mascot.classList.remove("eo-is-walking-left", "eo-is-walking-right", "eo-is-facing-left", "eo-is-facing-right");
        mascot.classList.add("eo-is-walking", directionClass, facingClass);
        window.clearTimeout(stickmanWalkTimer);
        stickmanWalkTimer = window.setTimeout(() => {
          mascot.classList.remove("eo-is-walking", "eo-is-walking-left", "eo-is-walking-right");
        }, walkDurationMs);
        return walkDurationMs;
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
      } else {
        const maxY = Math.max(headerSpace, window.innerHeight - mascotHeight - padding);
        y = Math.round(headerSpace + Math.random() * (maxY - headerSpace));
      }

      mascot.style.setProperty("--eo-mascot-move-duration", "3400ms");
      if (variant === "spider") {
        mascot.style.setProperty("--eo-mascot-page-y", `${y}px`);
        mascot.style.setProperty("--eo-mascot-y", `${Math.max(headerSpace, y - window.scrollY)}px`);
      } else {
        mascot.style.setProperty("--eo-mascot-y", `${y}px`);
      }
      mascot.style.setProperty("--eo-mascot-x", `${x}px`);
      mascot.classList.add("eo-is-walking");
      window.setTimeout(() => mascot.classList.remove("eo-is-walking"), 3400);
      return 3400;
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
      updateBubblePosition();
      mascot.classList.add("eo-is-speaking");
      window.clearTimeout(speechTimer);
      speechTimer = window.setTimeout(() => {
        mascot.classList.remove("eo-is-speaking");
      }, 4200);
    }

    function updateBubblePosition() {
      mascot.classList.remove("eo-bubble-right", "eo-bubble-left", "eo-bubble-top", "eo-bubble-bottom");

      const rect = mascot.getBoundingClientRect();
      const bubbleWidth = Math.min(260, window.innerWidth - 48);
      const bubbleHeight = 88;
      const gap = 20;
      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;
      const spaceTop = rect.top;
      const spaceBottom = window.innerHeight - rect.bottom;

      if (spaceRight >= bubbleWidth + gap) {
        mascot.classList.add("eo-bubble-right");
      } else if (spaceLeft >= bubbleWidth + gap) {
        mascot.classList.add("eo-bubble-left");
      } else if (spaceTop >= bubbleHeight + gap) {
        mascot.classList.add("eo-bubble-top");
      } else {
        mascot.classList.add(spaceBottom >= bubbleHeight + gap ? "eo-bubble-bottom" : "eo-bubble-top");
      }
    }

    function setVariant(nextVariant, { announce = true } = {}) {
      variant = VARIANTS.includes(nextVariant) ? nextVariant : getRandomVariant();
      if (variant !== "robot") robotCycleId += 1;
      mascot.classList.toggle("eo-mascot-robot", variant === "robot");
      mascot.classList.toggle("eo-mascot-spider", variant === "spider");
      mascot.classList.toggle("eo-mascot-stickman", variant === "stickman");
      setPickerState(picker, variant);
      const modeMessage = {
        robot: "Modo robot activado.",
        spider: "Modo arana activado.",
        stickman: "Modo stickman activado.",
      };

      if (variant === "robot") {
        setRobotOffscreenStart();
        runRobotCycle(announce ? modeMessage.robot : undefined);
        return;
      }

      const duration = move();
      window.setTimeout(() => speak(announce ? modeMessage[variant] : undefined), duration + 250);
      scheduleMove();
    }

    function runRobotCycle(customPhrase) {
      if (variant !== "robot") return;

      const cycleId = robotCycleId + 1;
      robotCycleId = cycleId;
      window.clearTimeout(moveTimer);
      const enterDuration = move();
      window.setTimeout(() => {
        if (cycleId !== robotCycleId || variant !== "robot") return;

        speak(customPhrase);
        window.setTimeout(() => {
          if (cycleId !== robotCycleId || variant !== "robot") return;

          const exitDuration = move({ offscreen: true });
          window.setTimeout(() => {
            if (cycleId === robotCycleId && variant === "robot") scheduleMove();
          }, exitDuration + 250);
        }, 4800);
      }, enterDuration + 250);
    }

    if (character) {
      character.addEventListener("click", () => {
        const clickPhrase = {
          robot: "Hola, soy el ayudante del portafolio.",
          spider: "Subiendo por el DOM.",
          stickman: "Sigo caminando por el piso.",
        };

      if (variant === "robot") {
        setRobotOffscreenStart();
        runRobotCycle(clickPhrase.robot);
        return;
      }

      const duration = move();
      window.setTimeout(() => speak(clickPhrase[variant]), duration + 250);
      scheduleMove();
      });
    }

    if (picker) {
      picker.addEventListener("click", (event) => {
        const button = event.target.closest("[data-eo-mascot-option]");
        if (button) setVariant(button.dataset.eoMascotOption);
      });
    }

    function runScheduledMove() {
      const shouldExit = variant === "spider" && Math.random() > 0.62;

      if (shouldExit) {
        const exitDuration = move({ offscreen: true });
        window.setTimeout(() => {
          const returnDuration = move();
          window.setTimeout(() => {
            speak();
            scheduleMove();
          }, returnDuration + 250);
        }, exitDuration + 1200);
        return;
      }

      const duration = move();
      window.setTimeout(() => {
        speak();
        scheduleMove();
      }, duration + 250);
    }

    function scheduleMove() {
      window.clearTimeout(moveTimer);
      moveTimer = window.setTimeout(
        variant === "robot" ? runRobotCycle : runScheduledMove,
        variant === "robot" ? robotReturnMs : getRandomMoveDelay()
      );
    }

    setVariant(variant, { announce: false });
    window.addEventListener("resize", () => {
      if (variant === "robot" && mascot.classList.contains("eo-is-offscreen")) {
        setRobotOffscreenStart();
        return;
      }

      move();
    });

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

    const pickerSelector = autoTarget.dataset.eoMascotPicker;

    init({
      variant: autoTarget.dataset.eoMascotVariant,
      pickerTarget: pickerSelector ? document.querySelector(pickerSelector) : null,
    });
  });
})();
