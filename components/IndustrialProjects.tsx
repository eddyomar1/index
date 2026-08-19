import { useState } from 'react';
import industrialProjectsData from '@/data/industrial-projects.json';
import { withBasePath } from '@/lib/basePath';
import type { IndustrialImage, IndustrialProject } from '@/types/industrialProject';

const industrialProjects = industrialProjectsData as IndustrialProject[];

export default function IndustrialProjects({ images }: { images: IndustrialImage[] }) {
  const [showAllImages, setShowAllImages] = useState(false);
  const visibleImages = showAllImages ? images : images.slice(0, 12);

  if (!industrialProjects.length && !images.length) {
    return (
      <div className="grid overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white shadow-lg lg:grid-cols-[0.7fr_1.3fr]">
        <div className="grid min-h-64 place-items-center bg-[linear-gradient(135deg,#101820,#0f766e)] p-8 text-white">
          <div className="text-center">
            <span className="text-6xl" aria-hidden="true">
              ⌁
            </span>
            <p className="mt-4 text-xs font-black tracking-[0.18em] text-amber-300 uppercase">
              Archivo profesional
            </p>
          </div>
        </div>
        <div className="p-7 sm:p-10">
          <p className="eyebrow">En preparación</p>
          <h3 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            Próximamente: proyectos y trabajos técnicos
          </h3>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Estoy organizando fotografías e información de algunos proyectos en los que trabajé como
            electrónico industrial. Cada caso mostrará el contexto, mi participación y el resultado,
            sin publicar información sensible de clientes o instalaciones.
          </p>
          <div className="mt-7 flex flex-wrap gap-3" aria-label="Contenido previsto">
            {['Fotografías', 'Contexto técnico', 'Participación', 'Resultados'].map((item) => (
              <span
                className="rounded-full border border-slate-900/10 bg-[#f7f4ee] px-4 py-2 text-sm font-black text-slate-700"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!industrialProjects.length) {
    return (
      <div>
        <div className="mb-8 max-w-3xl rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-lg sm:p-8">
          <p className="eyebrow">Galería de trabajos</p>
          <h3 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            Proyectos de electrónica industrial
          </h3>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Una selección de fotografías de trabajos en tableros eléctricos, montaje, cableado,
            protección, monitoreo y soluciones de control.
          </p>
        </div>

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          {visibleImages.map((image, index) => (
            <a
              className="group mb-4 block break-inside-avoid overflow-hidden rounded-2xl border border-slate-900/10 bg-white shadow-lg focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-amber-500"
              href={withBasePath(image.image_path)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Abrir ${image.image_alt}`}
              key={image.image_path}
            >
              <img
                className="h-auto w-full transition duration-300 group-hover:scale-[1.025]"
                src={withBasePath(image.image_path)}
                alt={image.image_alt}
                width="1280"
                height="960"
                loading={index < 4 ? 'eager' : 'lazy'}
              />
            </a>
          ))}
        </div>

        {images.length > 12 ? (
          <div className="mt-8 flex justify-center">
            <button
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-800 px-6 font-black text-white transition hover:bg-teal-900 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-amber-500"
              type="button"
              aria-expanded={showAllImages}
              onClick={() => setShowAllImages((current) => !current)}
            >
              {showAllImages ? 'Mostrar menos' : `Ver todas las fotografías (${images.length})`}
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {industrialProjects.map((project) => (
        <article
          className="overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white shadow-lg"
          key={project.id}
        >
          <img
            className="aspect-[4/3] w-full object-cover"
            src={withBasePath(project.image_path)}
            alt={project.image_alt}
            width="1200"
            height="900"
            loading="lazy"
          />
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-black tracking-wider text-teal-700 uppercase">
              {project.role ? <span>{project.role}</span> : null}
              {project.role && project.year ? <span aria-hidden="true">·</span> : null}
              {project.year ? <span>{project.year}</span> : null}
            </div>
            <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
              {project.title}
            </h3>
            <p className="mt-3 leading-7 text-slate-600">{project.summary}</p>
            {project.tags.length ? (
              <div
                className="mt-5 flex flex-wrap gap-2"
                aria-label={`Tecnologías de ${project.title}`}
              >
                {project.tags.map((tag) => (
                  <span
                    className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-900"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
