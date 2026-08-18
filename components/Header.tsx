import { useEffect, useRef, useState } from 'react';
import Mascot from '@/components/Mascot';

const navigation = [
  { href: '#proyectos', label: 'Proyectos' },
  { href: '#electronica', label: 'Electrónica' },
  { href: '#habilidades', label: 'Habilidades' },
  { href: '#recursos', label: 'Recursos' },
  { href: '#web3', label: 'Web3' },
  { href: '#contacto', label: 'Contacto' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      menuButtonRef.current?.focus();
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#101820]/95 text-white shadow-xl shadow-slate-950/10 backdrop-blur">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <a
          className="group flex items-center gap-3 rounded-xl font-black tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
          href="#inicio"
          aria-label="Ir al inicio"
          onClick={() => setIsOpen(false)}
        >
          <span className="grid size-11 place-items-center rounded-xl bg-amber-400 text-sm tracking-[-0.04em] text-slate-950 transition group-hover:-rotate-3">
            EO
          </span>
          <span className="text-lg">Eddy Omar</span>
        </a>

        <button
          ref={menuButtonRef}
          className="grid size-11 place-content-center gap-1.5 rounded-xl border border-white/20 md:hidden"
          type="button"
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isOpen}
          aria-controls="navegacion-principal"
          onClick={() => setIsOpen((current) => !current)}
        >
          <span
            className={`h-0.5 w-6 bg-white transition ${isOpen ? 'translate-y-2 rotate-45' : ''}`}
          />
          <span className={`h-0.5 w-6 bg-white transition ${isOpen ? 'opacity-0' : ''}`} />
          <span
            className={`h-0.5 w-6 bg-white transition ${isOpen ? '-translate-y-2 -rotate-45' : ''}`}
          />
        </button>

        <nav
          id="navegacion-principal"
          className={`${
            isOpen ? 'flex' : 'hidden'
          } absolute top-full right-0 left-0 flex-col gap-1 border-t border-white/10 bg-[#101820] p-5 shadow-2xl md:static md:flex md:flex-row md:items-center md:gap-1 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
          aria-label="Navegación principal"
        >
          {navigation.map((item) => (
            <a
              key={item.href}
              className="rounded-xl px-3 py-2.5 text-sm font-bold text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
              href={item.href}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <Mascot />
        </nav>
      </div>
    </header>
  );
}
