import { useEffect, useRef } from 'react';
import { withBasePath } from '@/lib/basePath';

interface MascotInstance {
  element: HTMLElement;
}

interface PortfolioMascotGlobal {
  init(options: { variant: string; pickerTarget: HTMLElement }): MascotInstance;
}

declare global {
  interface Window {
    PortfolioMascot?: PortfolioMascotGlobal;
  }
}

const scriptId = 'eo-mascot-widget-script';
const stylesheetId = 'eo-mascot-widget-styles';

export default function Mascot() {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialize = () => {
      if (!pickerRef.current || !window.PortfolioMascot) return;

      const existing = document.querySelector<HTMLElement>('[data-portfolio-mascot-react]');
      if (existing) return;

      const instance = window.PortfolioMascot.init({
        variant: 'random',
        pickerTarget: pickerRef.current,
      });
      instance.element.dataset.portfolioMascotReact = 'true';
    };

    if (!document.getElementById(stylesheetId)) {
      const stylesheet = document.createElement('link');
      stylesheet.id = stylesheetId;
      stylesheet.rel = 'stylesheet';
      stylesheet.href = withBasePath('/cdn/mascot-widget.css');
      document.head.appendChild(stylesheet);
    }

    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existingScript) {
      if (window.PortfolioMascot) initialize();
      else existingScript.addEventListener('load', initialize, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = withBasePath('/cdn/mascot-widget.js');
    script.async = true;
    script.addEventListener('load', initialize, { once: true });
    document.body.appendChild(script);
  }, []);

  return (
    <div className="mascot-controls border-t border-white/10 pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-4">
      <p className="mb-2 text-[0.65rem] font-black tracking-[0.16em] text-white/55 uppercase">
        Elige una mascota
      </p>
      <div ref={pickerRef} />
    </div>
  );
}
