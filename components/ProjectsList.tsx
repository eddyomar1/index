import { useEffect, useState } from 'react';
import ProjectCard from '@/components/ProjectCard';
import { getLocalProjects, getProjects } from '@/lib/projects';
import type { Project } from '@/types/project';

export default function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>(getLocalProjects);
  const [warning, setWarning] = useState('');

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
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {displayedProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} featured={index === 0} />
          ))}
        </div>
      ) : (
        <p className="rounded-3xl border border-slate-900/10 bg-white p-8 text-slate-600">
          Todavía no hay proyectos publicados.
        </p>
      )}
    </>
  );
}
