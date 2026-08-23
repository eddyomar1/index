import { useEffect, useState } from 'react';
import ProjectCard from '@/components/ProjectCard';
import { getLocalProjects, getProjects } from '@/lib/projects';
import type { Project } from '@/types/project';

const initialProjectCount = 5;

export default function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>(getLocalProjects);
  const [warning, setWarning] = useState('');
  const [showAllProjects, setShowAllProjects] = useState(false);

  useEffect(() => {
    let active = true;

    void getProjects().then((result) => {
      if (!active) return;
      setProjects(result.projects);
      setWarning(result.warning ?? '');
    });

    return () => {
      active = false;
    };
  }, []);

  const displayedProjects = projects
    .filter((project) => project.id !== 'horario')
    .sort((first, second) => {
      if (first.id === 'sputnik') return -1;
      if (second.id === 'sputnik') return 1;
      return first.sort_order - second.sort_order;
    });
  const visibleProjects = showAllProjects
    ? displayedProjects
    : displayedProjects.slice(0, initialProjectCount);
  const hiddenProjectCount = Math.max(0, displayedProjects.length - initialProjectCount);

  return (
    <>
      {warning ? (
        <p
          className="mb-6 rounded-2xl border border-amber-500/35 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="status"
        >
          {warning}
        </p>
      ) : null}

      {displayedProjects.length ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" id="project-grid">
            {visibleProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} featured={index === 0} />
            ))}
          </div>

          {hiddenProjectCount ? (
            <div className="mt-10 flex justify-center">
              <button
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-800 px-6 font-black text-white transition hover:bg-teal-900 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-amber-500"
                type="button"
                aria-controls="project-grid"
                aria-expanded={showAllProjects}
                onClick={() => setShowAllProjects((current) => !current)}
              >
                {showAllProjects
                  ? 'Mostrar menos proyectos'
                  : `Ver más proyectos (${hiddenProjectCount})`}
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <p className="rounded-3xl border border-slate-900/10 bg-white p-8 text-slate-600">
          Todavía no hay proyectos publicados.
        </p>
      )}
    </>
  );
}
