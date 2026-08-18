import Head from 'next/head';
import AdminProjects from '@/components/AdminProjects';
import { withBasePath } from '@/lib/basePath';

export default function AdminPage() {
  return (
    <>
      <Head>
        <title>Administrar proyectos | Eddy Omar</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" href={withBasePath('/favicon.svg')} type="image/svg+xml" />
      </Head>
      <main className="min-h-screen px-5 py-10 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <a className="admin-link" href={withBasePath('/')}>
            ← Volver al portafolio
          </a>
          <div className="mt-8 mb-10 max-w-3xl">
            <p className="eyebrow">Área privada</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl">
              Administración de proyectos
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              La seguridad depende de Supabase Auth y sus políticas RLS, no de que esta ruta sea
              poco visible.
            </p>
          </div>
          <AdminProjects />
        </div>
      </main>
    </>
  );
}
