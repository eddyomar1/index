import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { createProject, deleteProject, getProjects, updateProject } from '@/lib/projects';
import { getSupabaseClient, isSupabaseConfigured, isSupabaseEnabled } from '@/lib/supabase';
import type { Project, ProjectInput } from '@/types/project';

const emptyProject: ProjectInput = {
  title: '',
  description: '',
  project_type: '',
  demo_url: null,
  repo_url: null,
  image_path: null,
  image_alt: null,
  sort_order: 0,
  published: false,
};

function projectToInput(project: Project): ProjectInput {
  return {
    title: project.title,
    description: project.description,
    project_type: project.project_type,
    demo_url: project.demo_url,
    repo_url: project.repo_url,
    image_path: project.image_path,
    image_alt: project.image_alt ?? null,
    sort_order: project.sort_order,
    published: project.published,
  };
}

function optionalValue(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export default function AdminProjects() {
  const client = getSupabaseClient();
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(Boolean(client));
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<ProjectInput>(emptyProject);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isError, setIsError] = useState(false);

  const loadProjects = useCallback(async (ownerId: string) => {
    const result = await getProjects({ includeDrafts: true, ownerId });
    if (result.source !== 'supabase') {
      setProjects([]);
      setFeedback(
        result.warning ?? 'No se pudieron cargar los proyectos persistentes desde Supabase.',
      );
      setIsError(true);
      return false;
    }

    setProjects(result.projects);
    return true;
  }, []);

  useEffect(() => {
    if (!client) return;

    let active = true;

    void client.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setFeedback(error.message);
        setIsError(true);
      }
      setSession(data.session);
      setCheckingSession(false);
    });

    const { data: subscription } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setCheckingSession(false);
      if (!nextSession) setProjects([]);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [client]);

  useEffect(() => {
    if (!session) return;

    let active = true;
    void getProjects({ includeDrafts: true, ownerId: session.user.id }).then((result) => {
      if (!active) return;
      if (result.source !== 'supabase') {
        setProjects([]);
        setFeedback(
          result.warning ?? 'No se pudieron cargar los proyectos persistentes desde Supabase.',
        );
        setIsError(true);
        return;
      }

      setProjects(result.projects);
    });

    return () => {
      active = false;
    };
  }, [session]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client) return;

    setBusy(true);
    setFeedback('Iniciando sesión…');
    setIsError(false);
    const { error } = await client.auth.signInWithPassword({
      email: authEmail.trim(),
      password: authPassword,
    });

    if (error) {
      setFeedback(error.message);
      setIsError(true);
    } else {
      setAuthPassword('');
      setFeedback('Sesión iniciada.');
    }
    setBusy(false);
  };

  const handleLogout = async () => {
    if (!client) return;
    setBusy(true);
    const { error } = await client.auth.signOut();
    setFeedback(error ? error.message : 'Sesión cerrada.');
    setIsError(Boolean(error));
    setBusy(false);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session) return;

    if (!form.title.trim() || !form.description.trim() || !form.project_type.trim()) {
      setFeedback('Título, descripción y tipo son obligatorios.');
      setIsError(true);
      return;
    }

    const input: ProjectInput = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      project_type: form.project_type.trim(),
      demo_url: optionalValue(form.demo_url ?? ''),
      repo_url: optionalValue(form.repo_url ?? ''),
      image_path: optionalValue(form.image_path ?? ''),
      image_alt: optionalValue(form.image_alt ?? ''),
      sort_order: Number.isFinite(form.sort_order) ? form.sort_order : 0,
    };

    setBusy(true);
    setIsError(false);
    setFeedback(editingId ? 'Guardando cambios…' : 'Creando proyecto…');

    try {
      if (editingId) await updateProject(editingId, input);
      else await createProject(input, session.user.id);

      const reloaded = await loadProjects(session.user.id);
      setForm(emptyProject);
      setEditingId(null);
      if (reloaded) setFeedback(editingId ? 'Proyecto actualizado.' : 'Proyecto creado.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'No se pudo guardar el proyecto.');
      setIsError(true);
    } finally {
      setBusy(false);
    }
  };

  const startEditing = (project: Project) => {
    setEditingId(project.id);
    setForm(projectToInput(project));
    setFeedback(`Editando “${project.title}”.`);
    setIsError(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setForm(emptyProject);
    setFeedback('Edición cancelada.');
    setIsError(false);
  };

  const handleDelete = async (project: Project) => {
    if (!session) return;

    const confirmed = window.confirm(
      `¿Eliminar “${project.title}”? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    setBusy(true);
    setFeedback('Eliminando proyecto…');
    setIsError(false);

    try {
      await deleteProject(project.id);
      const reloaded = await loadProjects(session.user.id);
      if (editingId === project.id) {
        setEditingId(null);
        setForm(emptyProject);
      }
      if (reloaded) setFeedback('Proyecto eliminado.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'No se pudo eliminar el proyecto.');
      setIsError(true);
    } finally {
      setBusy(false);
    }
  };

  if (!isSupabaseEnabled()) {
    return (
      <div className="admin-notice">
        <h2>Supabase está deshabilitado</h2>
        <p>
          El portafolio público funciona con <code>data/projects.json</code>. Para iniciar sesión y
          guardar cambios persistentes, configura Supabase y cambia{' '}
          <code>NEXT_PUBLIC_ENABLE_SUPABASE=true</code> antes de volver a construir el sitio.
        </p>
      </div>
    );
  }

  if (!isSupabaseConfigured() || !client) {
    return (
      <div className="admin-notice admin-notice-error">
        <h2>Configuración incompleta</h2>
        <p>
          Supabase está habilitado, pero faltan <code>NEXT_PUBLIC_SUPABASE_URL</code> o{' '}
          <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>.
        </p>
      </div>
    );
  }

  if (checkingSession) {
    return <p role="status">Comprobando la sesión…</p>;
  }

  if (!session) {
    return (
      <form className="admin-panel mx-auto max-w-lg" onSubmit={handleLogin}>
        <h2 className="text-2xl font-black text-slate-950">Iniciar sesión</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Usa la cuenta administradora creada en Supabase Auth. Esta página no permite registrarse.
        </p>
        <label className="admin-label mt-6" htmlFor="admin-email">
          Correo electrónico
          <input
            className="admin-input"
            id="admin-email"
            type="email"
            autoComplete="username"
            required
            value={authEmail}
            onChange={(event) => setAuthEmail(event.target.value)}
          />
        </label>
        <label className="admin-label mt-4" htmlFor="admin-password">
          Contraseña
          <input
            className="admin-input"
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            value={authPassword}
            onChange={(event) => setAuthPassword(event.target.value)}
          />
        </label>
        <button className="admin-button mt-6" type="submit" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
        <p className={`mt-4 text-sm ${isError ? 'text-red-700' : 'text-teal-800'}`} role="status">
          {feedback}
        </p>
      </form>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
      <div>
        <div className="admin-panel mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black tracking-widest text-teal-700 uppercase">
              Sesión activa
            </p>
            <p className="mt-1 font-bold text-slate-950">{session.user.email ?? session.user.id}</p>
          </div>
          <button
            className="admin-button-secondary"
            type="button"
            onClick={handleLogout}
            disabled={busy}
          >
            Cerrar sesión
          </button>
        </div>

        <form className="admin-panel" onSubmit={handleSave}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-widest text-teal-700 uppercase">
                {editingId ? 'Editar' : 'Nuevo'}
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">Proyecto</h2>
            </div>
            {editingId ? (
              <button className="admin-link" type="button" onClick={cancelEditing}>
                Cancelar
              </button>
            ) : null}
          </div>

          <label className="admin-label mt-6" htmlFor="project-title">
            Título
            <input
              className="admin-input"
              id="project-title"
              required
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          </label>
          <label className="admin-label mt-4" htmlFor="project-type">
            Tipo
            <input
              className="admin-input"
              id="project-type"
              required
              value={form.project_type}
              onChange={(event) => setForm({ ...form, project_type: event.target.value })}
            />
          </label>
          <label className="admin-label mt-4" htmlFor="project-description">
            Descripción
            <textarea
              className="admin-input min-h-28 resize-y"
              id="project-description"
              required
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </label>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="admin-label" htmlFor="project-demo">
              URL de demo
              <input
                className="admin-input"
                id="project-demo"
                type="url"
                value={form.demo_url ?? ''}
                onChange={(event) => setForm({ ...form, demo_url: event.target.value })}
              />
            </label>
            <label className="admin-label" htmlFor="project-repo">
              URL del código
              <input
                className="admin-input"
                id="project-repo"
                type="url"
                value={form.repo_url ?? ''}
                onChange={(event) => setForm({ ...form, repo_url: event.target.value })}
              />
            </label>
          </div>

          <label className="admin-label mt-4" htmlFor="project-image">
            Ruta de imagen (por ejemplo, /img/proyecto.png)
            <input
              className="admin-input"
              id="project-image"
              value={form.image_path ?? ''}
              onChange={(event) => setForm({ ...form, image_path: event.target.value })}
            />
          </label>
          <label className="admin-label mt-4" htmlFor="project-image-alt">
            Texto alternativo de la imagen
            <input
              className="admin-input"
              id="project-image-alt"
              value={form.image_alt ?? ''}
              onChange={(event) => setForm({ ...form, image_alt: event.target.value })}
            />
          </label>

          <div className="mt-4 grid items-end gap-4 sm:grid-cols-2">
            <label className="admin-label" htmlFor="project-order">
              Orden
              <input
                className="admin-input"
                id="project-order"
                type="number"
                step="1"
                value={form.sort_order}
                onChange={(event) =>
                  setForm({ ...form, sort_order: Number.parseInt(event.target.value || '0', 10) })
                }
              />
            </label>
            <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-900/15 px-4 font-bold">
              <input
                className="size-5 accent-teal-700"
                type="checkbox"
                checked={form.published}
                onChange={(event) => setForm({ ...form, published: event.target.checked })}
              />
              Publicado
            </label>
          </div>

          <button className="admin-button mt-6" type="submit" disabled={busy}>
            {busy ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear proyecto'}
          </button>
          <p className={`mt-4 text-sm ${isError ? 'text-red-700' : 'text-teal-800'}`} role="status">
            {feedback}
          </p>
        </form>
      </div>

      <section className="admin-panel" aria-labelledby="admin-project-list-title">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black tracking-widest text-teal-700 uppercase">Supabase</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950" id="admin-project-list-title">
              Tus proyectos
            </h2>
          </div>
          <span className="text-sm font-bold text-slate-500">{projects.length} total</span>
        </div>

        <div className="mt-6 grid gap-4">
          {projects.length ? (
            projects.map((project) => (
              <article className="rounded-2xl border border-slate-900/10 p-5" key={project.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black text-slate-950">{project.title}</h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-black ${
                          project.published
                            ? 'bg-teal-100 text-teal-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {project.published ? 'Publicado' : 'Borrador'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{project.description}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400">#{project.sort_order}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-4">
                  <button
                    className="admin-link"
                    type="button"
                    onClick={() => startEditing(project)}
                  >
                    Editar
                  </button>
                  <button
                    className="font-bold text-red-700 underline underline-offset-4"
                    type="button"
                    onClick={() => void handleDelete(project)}
                    disabled={busy}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="text-slate-600">No hay proyectos asociados a esta cuenta.</p>
          )}
        </div>
      </section>
    </div>
  );
}
