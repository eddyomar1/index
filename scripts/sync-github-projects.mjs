import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(scriptDirectory, '..');
const configPath = path.join(rootDirectory, 'data', 'github-projects.config.json');
const curatedProjectsPath = path.join(rootDirectory, 'data', 'projects.json');
const generatedProjectsPath = path.join(rootDirectory, 'data', 'github-projects.generated.json');
const githubApiVersion = '2022-11-28';

function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function safeHttpsUrl(value) {
  if (!value) return null;

  try {
    const parsed = new URL(String(value).trim());
    return parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function repositoryNameFromUrl(value) {
  const url = safeHttpsUrl(value);
  if (!url) return null;

  const parsed = new URL(url);
  if (parsed.hostname !== 'github.com') return null;

  const segments = parsed.pathname.split('/').filter(Boolean);
  return segments.length >= 2 ? normalize(segments[1].replace(/\.git$/i, '')) : null;
}

function humanizeRepositoryName(name) {
  const words = name.replace(/[-_]+/g, ' ').trim();
  if (!words) return name;
  if (words === words.toUpperCase()) return words;
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function projectTypeFor(repository) {
  const topics = repository.topics.map(normalize);
  const language = normalize(repository.language);

  if (topics.includes('arduino-library')) return 'Biblioteca para Arduino';
  if (topics.some((topic) => ['arduino', 'embedded', 'esp32', 'microcontroller'].includes(topic))) {
    return 'Sistemas embebidos';
  }
  if (topics.some((topic) => ['game', 'games', 'gaming'].includes(topic))) return 'Juego';
  if (['html', 'css', 'javascript', 'typescript', 'php'].includes(language)) {
    return 'Proyecto web';
  }
  if (['c', 'c++', 'assembly'].includes(language)) return 'Sistemas embebidos';
  return repository.language ? `Proyecto en ${repository.language}` : 'Proyecto de software';
}

function defaultDescription(repository) {
  if (repository.language) {
    return `Proyecto público desarrollado principalmente con ${repository.language}. Consulta la demo o el código para conocerlo en detalle.`;
  }

  return 'Proyecto público disponible en GitHub. Consulta la demo o el código para conocerlo en detalle.';
}

function slugify(value) {
  const slug = normalize(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'project';
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function fetchRepositories(username) {
  const token = process.env.GITHUB_TOKEN?.trim();
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'eddy-omar-portfolio-project-sync',
    'X-GitHub-Api-Version': githubApiVersion,
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const repositories = [];

  for (let page = 1; page <= 10; page += 1) {
    const endpoint = new URL(`https://api.github.com/users/${encodeURIComponent(username)}/repos`);
    endpoint.searchParams.set('type', 'owner');
    endpoint.searchParams.set('sort', 'pushed');
    endpoint.searchParams.set('direction', 'desc');
    endpoint.searchParams.set('per_page', '100');
    endpoint.searchParams.set('page', String(page));

    const response = await fetch(endpoint, {
      headers,
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      throw new Error(`GitHub respondió ${response.status} al consultar la página ${page}.`);
    }

    const pageRepositories = await response.json();
    if (!Array.isArray(pageRepositories)) {
      throw new Error('GitHub devolvió una respuesta inesperada.');
    }

    repositories.push(...pageRepositories);
    if (pageRepositories.length < 100) break;
  }

  return repositories;
}

function isEligible(repository, config, curatedRepositoryNames) {
  const name = normalize(repository.name);
  const topics = Array.isArray(repository.topics) ? repository.topics.map(normalize) : [];
  const excludedRepositories = config.exclude_repositories.map(normalize);
  const excludedTopics = config.exclude_topics.map(normalize);
  const includedTopics = config.include_topics.map(normalize);

  if (
    repository.private ||
    repository.fork ||
    repository.archived ||
    repository.disabled ||
    curatedRepositoryNames.has(name) ||
    excludedRepositories.includes(name) ||
    topics.some((topic) => excludedTopics.includes(topic))
  ) {
    return false;
  }

  const hasDescription = Boolean(String(repository.description ?? '').trim());
  const hasHomepage = Boolean(safeHttpsUrl(repository.homepage));
  const hasIncludedTopic = topics.some((topic) => includedTopics.includes(topic));

  return hasDescription || hasHomepage || hasIncludedTopic;
}

function toProject(repository, username, sortOrder) {
  const homepage = safeHttpsUrl(repository.homepage);
  const pagesUrl = repository.has_pages
    ? `https://${encodeURIComponent(username)}.github.io/${encodeURIComponent(repository.name)}/`
    : null;
  const description = String(repository.description ?? '').trim();

  return {
    id: `github-${slugify(repository.name)}`,
    title: humanizeRepositoryName(repository.name),
    description: description || defaultDescription(repository),
    project_type: projectTypeFor(repository),
    demo_url: homepage ?? pagesUrl,
    repo_url: `https://github.com/${encodeURIComponent(username)}/${encodeURIComponent(repository.name)}`,
    image_path: null,
    image_alt: null,
    sort_order: sortOrder,
    published: true,
  };
}

async function main() {
  const [config, curatedProjects] = await Promise.all([
    readJson(configPath),
    readJson(curatedProjectsPath),
  ]);

  const username = String(config.username ?? '').trim();
  if (!username || !Array.isArray(curatedProjects)) {
    throw new Error('La configuración del escáner no es válida.');
  }

  for (const key of ['exclude_repositories', 'include_topics', 'exclude_topics']) {
    if (!Array.isArray(config[key])) throw new Error(`La opción ${key} debe ser una lista.`);
  }

  const curatedRepositoryNames = new Set(
    curatedProjects.map((project) => repositoryNameFromUrl(project.repo_url)).filter(Boolean),
  );
  const firstGeneratedOrder =
    curatedProjects.reduce((maximum, project) => Math.max(maximum, project.sort_order ?? 0), 0) + 1;
  const repositories = await fetchRepositories(username);
  const generatedProjects = repositories
    .filter((repository) => isEligible(repository, config, curatedRepositoryNames))
    .map((repository, index) => toProject(repository, username, firstGeneratedOrder + index));

  await writeFile(generatedProjectsPath, `${JSON.stringify(generatedProjects, null, 2)}\n`, 'utf8');
  console.log(
    `GitHub: ${repositories.length} repositorios revisados; ${generatedProjects.length} proyectos automáticos generados.`,
  );
  if (generatedProjects.length) {
    console.log(`Incluidos: ${generatedProjects.map((project) => project.title).join(', ')}`);
  }
}

main().catch((error) => {
  console.error(`No se pudo actualizar la lista automática: ${error.message}`);
  console.error('Se conservará la última lista generada disponible.');
  process.exitCode = process.env.CI ? 0 : 1;
});
