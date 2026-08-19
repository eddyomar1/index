import { withBasePath } from '@/lib/basePath';

export default function Footer() {
  return (
    <footer className="border-t border-slate-900/10 bg-[#f7f4ee] px-5 py-8 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p>Portafolio de Eddy Omar SB · Desarrollado con Next.js, React y TypeScript.</p>
          <p className="mt-1 text-xs text-slate-500">
            Estilos con Tailwind CSS · Formulario conectado a Supabase o Formspree cuando están
            disponibles.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 font-bold text-slate-900">
          <a className="hover:text-teal-700" href="#inicio">
            Volver arriba
          </a>
          <a className="hover:text-teal-700" href={withBasePath('/admin/')}>
            Administrar proyectos
          </a>
          <a
            className="hover:text-teal-700"
            href="https://github.com/eddyomar1/index"
            target="_blank"
            rel="noopener noreferrer"
          >
            Código ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
