# Portafolio de Eddy Omar

Portafolio personal estático con proyectos web, certificados, recursos técnicos, una demo Web3 y un panel opcional para administrar proyectos. Conserva el contenido de la versión HTML original y está preparado para publicarse como proyecto de GitHub Pages en:

<https://eddyomar1.github.io/index/>

## Stack

- Next.js con Pages Router y exportación estática.
- React y TypeScript estricto.
- Tailwind CSS 4 y una capa pequeña de estilos globales.
- Supabase opcional para proyectos, autenticación y mensajes.
- Formspree opcional como respaldo del formulario.
- GitHub Actions y `gh-pages` para publicar la carpeta `out/`.

No hay API Routes, servidor persistente, middleware, Server Actions ni código que necesite un runtime de Node.js en producción.

## Requisitos

- Node.js 24 recomendado (consulta `.nvmrc`).
- npm 11 o una versión compatible con Node 24.

Las dependencias actuales requieren como mínimo Node 22.

## Configuración local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre <http://localhost:3000/>. Para desarrollo local, deja `NEXT_PUBLIC_BASE_PATH` vacío. `.env.local` contiene configuración local, está ignorado por Git y no debe confirmarse en el repositorio.

## Scripts npm

| Comando                | Función                                                          |
| ---------------------- | ---------------------------------------------------------------- |
| `npm run dev`          | Inicia Next.js en desarrollo.                                    |
| `npm run build`        | Genera el sitio estático en `out/`.                              |
| `npm run lint`         | Ejecuta ESLint sin aceptar warnings.                             |
| `npm run lint:fix`     | Corrige problemas de ESLint cuando es seguro.                    |
| `npm run typecheck`    | Valida TypeScript sin emitir archivos.                           |
| `npm run format`       | Formatea el código con Prettier.                                 |
| `npm run format:check` | Comprueba el formato sin modificar archivos.                     |
| `npm run deploy`       | Construye y publica `out/` en `gh-pages`; sí modifica el remoto. |

Validación completa:

```bash
npm run lint
npm run typecheck
npm run format:check
npm run build
```

## Exportación estática y rutas

`next.config.js` usa `output: 'export'`, `trailingSlash: true` e imágenes sin optimización de servidor. `npm run build` es suficiente para crear `out/`.

GitHub Pages sirve este repositorio bajo `/index/`. La variable `NEXT_PUBLIC_BASE_PATH` queda incorporada durante el build:

- Local: valor vacío y URL `/`.
- Producción: `/index` y URL `/index/`.

`lib/basePath.ts` agrega ese prefijo a imágenes, descargas, favicon y assets de `public/`. No se usa `assetPrefix`.

## Variables de entorno

Copia `.env.example` a `.env.local` únicamente para trabajar en tu equipo:

```dotenv
NEXT_PUBLIC_BASE_PATH=
NEXT_PUBLIC_ENABLE_SUPABASE=false
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_FORMSPREE_FORM_ID=
```

Supabase está deshabilitado si `NEXT_PUBLIC_ENABLE_SUPABASE` no es exactamente `true`. En ese estado, la portada usa `data/projects.json`, el formulario ofrece correo directo y `/admin/` explica que el CRUD persistente no está disponible.

## Arquitectura de GitHub Pages

La rama fuente es `master`. El workflow `.github/workflows/gh-pages.yml` valida el proyecto, construye con `NEXT_PUBLIC_BASE_PATH=/index` y publica solo el contenido de `out/` en la rama `gh-pages`. `scripts/deploy.sh` agrega `.nojekyll` y utiliza el paquete local y fijado `gh-pages`; en CI autentica con `GITHUB_TOKEN`, no con un token personal.

No ejecutes `npm run deploy` para una simple validación local: ese comando intenta publicar en el remoto.

### Configuración única de Pages

Después de que exista la rama `gh-pages`, abre:

1. Repositorio de GitHub → **Settings** → **Pages**.
2. En **Build and deployment**, elige **Deploy from a branch**.
3. Selecciona la rama **gh-pages** y la carpeta **/ (root)**.
4. Guarda y confirma que la URL sea <https://eddyomar1.github.io/index/>.

GitHub documenta actualmente una limitación: un push hecho por un workflow con su propio `GITHUB_TOKEN` **no inicia** el build de Pages cuando la fuente es una rama. Por eso esta arquitectura literal actualizará `gh-pages`, pero no garantiza que la URL se vuelva a publicar automáticamente. La alternativa oficial y recomendada es cambiar **Source** a **GitHub Actions** y migrar el workflow a `actions/upload-pages-artifact` + `actions/deploy-pages`. Si es obligatorio conservar **Deploy from a branch**, el push necesita una GitHub App o un token distinto con permisos mínimos; no agregues un PAT de larga duración sin revisar antes sus permisos y necesidad.

## Despliegue

Cada push a `master` o ejecución manual de **Deploy portfolio to GitHub Pages** activa el workflow. Antes de publicar ejecuta:

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run format:check`
5. `bash scripts/deploy.sh` (incluye el build estático)

Para probar un build de producción sin publicar:

```bash
NEXT_PUBLIC_BASE_PATH=/index NEXT_PUBLIC_ENABLE_SUPABASE=false npm run build
```

## Secrets y variables de GitHub

En **GitHub repository → Settings → Secrets and variables → Actions**, puedes crear estos **Repository secrets**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_FORMSPREE_FORM_ID`

Para activar Supabase en producción, crea además esta **Repository variable**:

- `ENABLE_SUPABASE=true`

Si la variable falta o es falsa, el build deja Supabase deshabilitado.

Guardar un valor `NEXT_PUBLIC_*` en GitHub Secrets evita que aparezca en el código fuente confirmado, pero **no lo mantiene secreto frente a usuarios del navegador** después del build. Son valores públicos de cliente incorporados en JavaScript. La publishable key de Supabase está diseñada para este uso únicamente cuando RLS está correctamente configurado.

Nunca agregues `SUPABASE_SERVICE_ROLE_KEY`, una secret key de Supabase ni ninguna credencial privilegiada a código frontend, `NEXT_PUBLIC_*`, `.env.local` confirmado o GitHub Pages.

## Habilitar Supabase

1. Crea un proyecto en Supabase.
2. Abre **SQL Editor** y ejecuta todo `supabase/schema.sql`.
3. En **Authentication → Users**, crea tu cuenta administradora de email/contraseña.
4. Considera deshabilitar el registro público en la configuración de Auth para que solo exista la cuenta administradora.
5. Configura URL y publishable key en `.env.local` o en los secrets de GitHub.
6. Define `NEXT_PUBLIC_ENABLE_SUPABASE=true` localmente o `ENABLE_SUPABASE=true` en GitHub.
7. Reconstruye el sitio: las variables públicas se fijan al compilar.

El panel está en `/admin/`. Permite iniciar/cerrar sesión y crear, editar o eliminar proyectos. Ocultar esa URL no es una medida de seguridad: Supabase Auth y las políticas RLS de `supabase/schema.sql` son la barrera real.

### RLS y seguridad

El esquema aplica estas reglas:

- Visitantes anónimos solo pueden leer proyectos publicados.
- Cada usuario autenticado puede leer sus borradores y gestionar exclusivamente sus propias filas.
- Visitantes pueden insertar mensajes de contacto, pero no leerlos, editarlos ni eliminarlos.
- No se concede edición de proyectos a usuarios anónimos.

Mantén RLS habilitado. Revisa los mensajes desde el dashboard o un entorno confiable, nunca añadiendo una lectura pública al frontend. Como el formulario admite inserciones anónimas, considera CAPTCHA o rate limiting si recibes abuso.

### URLs de Auth

La primera versión usa email/contraseña y no necesita OAuth. Si después agregas OAuth o magic links, configura en Supabase Auth los redirect URLs apropiados, por ejemplo:

- `http://localhost:3000/admin/`
- `https://eddyomar1.github.io/index/admin/`

## Formulario de contacto

La estrategia de envío es:

1. Insertar en `contact_messages` cuando Supabase está habilitado y configurado.
2. Si Supabase está deshabilitado o no disponible, usar Formspree cuando exista `NEXT_PUBLIC_FORMSPREE_FORM_ID`.
3. Si ningún proveedor está configurado, mostrar `eddyomarscb@gmail.com` y un enlace `mailto:` sin romper la página.

Para Formspree, crea tu propio formulario y guarda únicamente su ID en la variable indicada. El repositorio no contiene un ID de producción ficticio.

## Versión anterior y rollback

Los archivos de entrada que existían antes de Next.js se conservaron en:

- `legacy-static/index.html`
- `legacy-static/cs.css`
- `legacy-static/js.js`
- `legacy-static/loading.css`

Las copias incluyen los cambios locales que ya estaban presentes al iniciar la migración, incluida la mascota búho neón. Los binarios no se duplicaron: imágenes, descargas, favicon y el widget CDN viven bajo `public/`.

## Privacidad y seguridad

- Trata el repositorio público y cada archivo generado en GitHub Pages como públicamente legibles.
- Nunca pongas datos reales de CRM o clientes en JSON de ejemplo.
- Nunca confirmes PII de clientes.
- Nunca pegues credenciales de producción ni datos de clientes en prompts de LLM.
- Usa datos sintéticos o demo al desarrollar funciones de IA.
- No asumas que un tier gratuito de IA/API ofrece confidencialidad adecuada para datos de clientes.
- Revisa privacidad, retención y entrenamiento de cada proveedor antes de procesar información real.
- Mantén RLS activo y no expongas claves `service_role` o secretas.
- No confirmes `.env.local`.
- `public/dw/arNano/CH341SER.EXE` es un binario heredado: consérvalo como descarga histórica, pero analízalo con herramientas de seguridad antes de ejecutarlo.
