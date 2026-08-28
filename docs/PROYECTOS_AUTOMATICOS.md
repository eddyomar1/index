# Proyectos automáticos

El portafolio conserva los proyectos editados manualmente en `data/projects.json` y, además,
descubre proyectos públicos de la cuenta configurada en `data/github-projects.config.json`.

## Cuándo aparece un repositorio

El escáner incluye un repositorio cuando:

- pertenece a la cuenta configurada;
- es público, no es un fork y no está archivado ni deshabilitado;
- no está ya incluido en `data/projects.json`; y
- tiene una descripción, una página web HTTPS configurada o el tema `portfolio-project`.

La descripción de GitHub se usa como texto de la ficha. Si el repositorio tiene GitHub Pages, su
dirección se usa como demo; el código siempre enlaza al repositorio. Si no hay imagen local, la
tarjeta muestra el marcador visual del portafolio.

## Mostrar u ocultar proyectos

- Para forzar la inclusión, añade el tema `portfolio-project` al repositorio en GitHub.
- Para ocultarlo, añade el tema `portfolio-hidden`.
- También puedes añadir su nombre a `exclude_repositories` en
  `data/github-projects.config.json`.
- Para personalizar completamente una ficha, añádela a `data/projects.json`; la entrada manual
  tendrá prioridad sobre la automática.

## Actualización

GitHub Actions ejecuta `npm run projects:sync` antes de cada despliegue y una vez por semana. Para
actualizar la lista localmente, ejecuta el mismo comando. El token es opcional para repositorios
públicos; dentro de Actions se utiliza el `GITHUB_TOKEN` temporal con permisos de solo lectura.

Si la API no está disponible durante un despliegue, la compilación conserva la última lista
generada en lugar de dejar el portafolio sin proyectos.
