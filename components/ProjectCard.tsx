import { withBasePath } from '@/lib/basePath';
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

export default function ProjectCard({ project, featured = false }: ProjectCardProps) {
  return (
    <article
      className={`group overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white shadow-[0_18px_55px_rgba(16,24,32,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(16,24,32,0.14)] ${
        featured ? 'md:col-span-2 md:grid md:grid-cols-[1.2fr_1fr]' : ''
      }`}
    >
      {project.image_path ? (
        <a
          className="block min-h-56 overflow-hidden bg-slate-900 focus-visible:outline-4 focus-visible:outline-amber-400"
          href={project.demo_url ?? project.repo_url ?? '#proyectos'}
          target={project.demo_url || project.repo_url ? '_blank' : undefined}
          rel={project.demo_url || project.repo_url ? 'noopener noreferrer' : undefined}
          aria-label={`Abrir ${project.title}`}
        >
          {/* Public portfolio screenshots are intentionally served as static files. */}
          <img
            className="h-full min-h-56 w-full object-cover transition duration-500 group-hover:scale-[1.025]"
            src={withBasePath(project.image_path)}
            alt={project.image_alt || `Vista previa de ${project.title}`}
            width="1366"
            height="768"
            loading={featured ? 'eager' : 'lazy'}
          />
        </a>
      ) : (
        <div
          className="flex min-h-28 items-end bg-[linear-gradient(135deg,#101820,#164e63)] p-6 text-5xl font-black tracking-[-0.08em] text-white/20"
          aria-hidden="true"
        >
          EO/{String(project.sort_order).padStart(2, '0')}
        </div>
      )}

      <div className="flex h-full flex-col p-6 sm:p-8">
        <p className="mb-3 text-xs font-black tracking-[0.18em] text-teal-700 uppercase">
          {project.project_type}
        </p>
        <h3 className="text-2xl font-black tracking-tight text-slate-950">{project.title}</h3>
        <p className="mt-3 flex-1 leading-7 text-slate-600">{project.description}</p>
        <div className="mt-6 flex flex-wrap gap-5" aria-label={`Enlaces de ${project.title}`}>
          {project.demo_url ? <ExternalLink href={project.demo_url}>Demo</ExternalLink> : null}
          {project.repo_url ? <ExternalLink href={project.repo_url}>Código</ExternalLink> : null}
        </div>
      </div>
    </article>
  );
}
