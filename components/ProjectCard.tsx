import { withBasePath } from '@/lib/basePath';
import { getSafeExternalUrl, getSafeImagePath } from '@/lib/safeUrl';
import type { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      className="inline-flex items-center gap-1 font-bold text-teal-800 underline decoration-teal-800/25 decoration-2 underline-offset-4 transition hover:text-teal-950 hover:decoration-teal-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <span aria-hidden="true">↗</span>
    </a>
  );
}

function UnavailableLink({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex cursor-not-allowed items-center gap-1 font-bold text-slate-400"
      aria-disabled="true"
      title="Enlace no disponible"
    >
      {children}
      <span aria-hidden="true">—</span>
      <span className="sr-only">no disponible</span>
    </span>
  );
}

export default function ProjectCard({ project, featured = false }: ProjectCardProps) {
  const demoUrl = getSafeExternalUrl(project.demo_url);
  const repoUrl = getSafeExternalUrl(project.repo_url);
  const destinationUrl = demoUrl ?? repoUrl;
  const imagePath = getSafeImagePath(project.image_path);

  return (
    <article
      className={`group overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white shadow-[0_18px_55px_rgba(16,24,32,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(16,24,32,0.14)] ${
        featured ? 'md:col-span-2 md:grid md:grid-cols-[1.2fr_1fr]' : ''
      }`}
    >
      {imagePath ? (
        <a
          className="block min-h-56 overflow-hidden bg-slate-900 focus-visible:outline-4 focus-visible:outline-amber-400"
          href={destinationUrl ?? '#proyectos'}
          target={destinationUrl ? '_blank' : undefined}
          rel={destinationUrl ? 'noopener noreferrer' : undefined}
          aria-label={`Abrir ${project.title}`}
        >
          {/* Public portfolio screenshots are intentionally served as static files. */}
          <img
            className="h-full min-h-56 w-full object-cover transition duration-500 group-hover:scale-[1.025]"
            src={withBasePath(imagePath)}
            alt={project.image_alt || `Vista previa de ${project.title}`}
            width="1366"
            height="768"
            loading="eager"
            decoding="async"
          />
        </a>
      ) : (
        <div
          className="flex min-h-56 flex-col items-start justify-end bg-[linear-gradient(135deg,#101820,#164e63)] p-6"
          role="img"
          aria-label={`Vista previa pendiente de ${project.title}`}
        >
          <span className="text-5xl font-black tracking-[-0.08em] text-white/20" aria-hidden="true">
            EO/{String(project.sort_order).padStart(2, '0')}
          </span>
          <span className="mt-3 text-xs font-black tracking-[0.16em] text-white/65 uppercase">
            Vista previa pendiente
          </span>
        </div>
      )}

      <div className="flex h-full flex-col p-6 sm:p-8">
        <p className="mb-3 text-xs font-black tracking-[0.18em] text-teal-700 uppercase">
          {project.project_type}
        </p>
        <h3 className="text-2xl font-black tracking-tight text-slate-950">{project.title}</h3>
        <p className="mt-3 flex-1 leading-7 text-slate-600">{project.description}</p>
        <div className="mt-6 flex flex-wrap gap-5" aria-label={`Enlaces de ${project.title}`}>
          {demoUrl ? (
            <ExternalLink href={demoUrl}>Demo</ExternalLink>
          ) : (
            <UnavailableLink>Demo</UnavailableLink>
          )}
          {repoUrl ? (
            <ExternalLink href={repoUrl}>Código</ExternalLink>
          ) : (
            <UnavailableLink>Código</UnavailableLink>
          )}
        </div>
      </div>
    </article>
  );
}
