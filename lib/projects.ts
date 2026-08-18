import localProjectsData from '@/data/projects.json';
import { getSupabaseClient, isSupabaseConfigured, isSupabaseEnabled } from '@/lib/supabase';
import type { Project, ProjectInput } from '@/types/project';

export interface ProjectsResult {
  projects: Project[];
  source: 'local' | 'supabase';
  warning?: string;
}

interface GetProjectsOptions {
  includeDrafts?: boolean;
  ownerId?: string;
}

const localProjects = (localProjectsData as Project[])
  .filter((project) => project.published)
  .sort((left, right) => left.sort_order - right.sort_order);

export function getLocalProjects(): Project[] {
  return localProjects.map((project) => ({ ...project }));
}

export async function getProjects(options: GetProjectsOptions = {}): Promise<ProjectsResult> {
  const client = getSupabaseClient();

  if (!client) {
    const warning =
      isSupabaseEnabled() && !isSupabaseConfigured()
        ? 'Supabase está habilitado, pero faltan sus variables públicas. Se muestran los proyectos locales.'
        : undefined;

    return { projects: getLocalProjects(), source: 'local', warning };
  }

  try {
    let query = client.from('projects').select('*').order('sort_order', { ascending: true });

    if (!options.includeDrafts) {
      query = query.eq('published', true);
    }

    if (options.ownerId) {
      query = query.eq('owner_id', options.ownerId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return { projects: (data ?? []) as Project[], source: 'supabase' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';

    if (process.env.NODE_ENV === 'development') {
      console.warn(`No se pudieron cargar los proyectos desde Supabase: ${message}`);
    }

    return {
      projects: getLocalProjects(),
      source: 'local',
      warning:
        process.env.NODE_ENV === 'development'
          ? 'Supabase no respondió. Esta vista usa temporalmente los proyectos locales.'
          : undefined,
    };
  }
}

function requireClient() {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error('El CRUD persistente requiere habilitar y configurar Supabase.');
  }

  return client;
}

export async function createProject(input: ProjectInput, ownerId: string): Promise<Project> {
  const client = requireClient();
  const { data, error } = await client
    .from('projects')
    .insert({ ...input, owner_id: ownerId })
    .select('*')
    .single();

  if (error) throw error;
  return data as Project;
}

export async function updateProject(id: string, input: ProjectInput): Promise<Project> {
  const client = requireClient();
  const { data, error } = await client
    .from('projects')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as Project;
}

export async function deleteProject(id: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('projects').delete().eq('id', id);

  if (error) throw error;
}
