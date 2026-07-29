<div align="center">
  <img src="public/brand/vm-lockup.svg" alt="Verónica Méndez — Agente de Seguros Certificada — Seguros con Sentido Humano" width="300">
</div>

# Verónica Méndez — Seguros con Sentido Humano

Sitio profesional de **Verónica Méndez**, Agente de Seguros Certificada, con un
administrador sencillo para que ella misma mantenga el contenido al día.

Una sola página pública con navegación por anclas, contacto directo por WhatsApp
y correo, y un CMS protegido en `/admin`. Sin formularios, sin captura de datos
personales y sin funciones que el proyecto no necesita.

---

## Índice

1. [Qué incluye](#qué-incluye)
2. [Stack](#stack)
3. [Arquitectura](#arquitectura)
4. [Estructura de carpetas](#estructura-de-carpetas)
5. [Instalación y desarrollo local](#instalación-y-desarrollo-local)
6. [Variables de entorno](#variables-de-entorno)
7. [Supabase: base de datos, migraciones y almacenamiento](#supabase-base-de-datos-migraciones-y-almacenamiento)
8. [Crear la primera administradora](#crear-la-primera-administradora)
9. [Pruebas](#pruebas)
10. [Build y despliegue](#build-y-despliegue)
11. [Mantenimiento del contenido](#mantenimiento-del-contenido)
12. [Decisiones de diseño](#decisiones-de-diseño)

---

## Qué incluye

### Página pública (`/`)

| Sección | Contenido |
| --- | --- |
| Encabezado | Monograma VM, nombre, navegación por anclas y botón de contacto |
| Inicio | Titular editorial, frase de marca, botones de WhatsApp y correo, placa de firma |
| Seguros | Los ramos disponibles, con dos destacados y el resto como índice editorial |
| Sentido humano | Los cinco puntos que distinguen su forma de acompañar |
| Proceso | Los tres pasos del acompañamiento sobre la curva de la marca |
| Sobre Verónica | Biografía, cita destacada y fotografía opcional |
| Aseguradoras | Nombres en tipografía, con nota sobre disponibilidad de productos |
| Formas de pago | Modalidades y meses sin intereses, con nota de condiciones |
| Cierre y contacto | Llamada final, correo visible y cobertura nacional |
| Pie | Identidad, correo, año dinámico y nota prudente |

El número de WhatsApp **nunca aparece escrito**: sólo se usa para construir el
enlace `wa.me` con el mensaje prellenado.

### Administrador (`/admin`)

Una sola administradora puede editar:

- **Identidad y contacto** — nombre, cargo, frase de marca, correo, número
  interno de WhatsApp, mensaje prellenado y texto de cobertura.
- **Inicio** — etiqueta, título, descripción, textos de los botones y fotografía
  opcional.
- **Seguros** — crear, editar, reordenar, mostrar/ocultar y eliminar (con
  confirmación).
- **Sobre Verónica** — título, introducción, biografía, cita e imagen opcional.
- **Aseguradoras** — crear, editar, reordenar, mostrar/ocultar, eliminar y
  logotipo opcional.
- **Promociones y pagos** — título, descripción, nota de condiciones y
  visibilidad de la sección.
- **Tu cuenta** — cambio de contraseña.

No hay CRM, prospectos, cotizador, blog, agenda, pagos ni constructor de
páginas: el alcance es deliberadamente sencillo.

---

## Stack

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 15 (App Router) + React 19 |
| Lenguaje | TypeScript en modo estricto |
| Base de datos | Supabase (PostgreSQL con Row Level Security) |
| Autenticación | Supabase Auth con sesiones en cookies (`@supabase/ssr`) |
| Imágenes | Supabase Storage (bucket `site-media`) + `next/image` |
| Estilos | CSS propio: variables de diseño globales + CSS Modules |
| Animación | `motion`, siempre condicionada a `prefers-reduced-motion` |
| Validación | Zod, compartida entre cliente y servidor |
| Tipografía | Newsreader y Manrope vía `next/font` |
| Pruebas | Vitest + Testing Library, Playwright |
| CI | GitHub Actions |
| Hospedaje | Vercel |

Sin bibliotecas de componentes ni plantillas: todos los componentes son propios.

---

## Arquitectura

```
Navegador
   │
   ├── /  ─────────────► Server Component
   │                     └── getPublicContent()  ── cliente anónimo ──► Supabase
   │                         · cacheado con la etiqueta "site-content"
   │                         · respaldo en src/content/site-content.ts
   │
   └── /admin ─────────► middleware (sesión) ──► Server Component
                         └── getAdminContent()  ── sesión de la administradora
                             └── Server Actions ── validación Zod ──► Supabase
                                 └── revalidateTag("site-content")
```

Puntos clave:

- **La página pública no depende de ninguna sesión.** Se lee con la clave
  pública y Row Level Security garantiza que sólo llegue contenido publicado,
  así que se puede cachear y servir al instante.
- **Al guardar en el CMS se invalida la etiqueta de caché**, de modo que el
  cambio aparece en el sitio público inmediatamente.
- **Si Supabase no responde**, la página cae en el contenido versionado del
  repositorio en lugar de romperse. El CMS, en cambio, nunca simula persistir:
  si falla, lo dice.
- **Toda mutación se comprueba tres veces**: en el navegador (Zod), en el
  servidor (Zod + `is_admin()`) y en la base de datos (RLS + `check`).

---

## Estructura de carpetas

```
.
├── .github/workflows/ci.yml      Lint, tipos, pruebas, build y end-to-end
├── public/brand/                 Monograma, lockup y favicon (SVG)
├── scripts/
│   └── generate-brand-assets.mjs Genera public/brand/ desde src/lib/brand.ts
├── src/
│   ├── actions/                  Server Actions del administrador
│   ├── app/
│   │   ├── admin/                CMS: panel y pantalla de acceso
│   │   ├── globals.css           Variables de diseño y primitivas
│   │   ├── layout.tsx            Tipografías y metadatos
│   │   ├── opengraph-image.tsx   Imagen para compartir
│   │   ├── page.tsx              La página pública
│   │   ├── robots.ts             robots.txt
│   │   └── sitemap.ts            sitemap.xml
│   ├── components/
│   │   ├── admin/                Formularios y controles del CMS
│   │   ├── brand/                Monograma y curva de trayectoria
│   │   ├── motion/               Apariciones y parallax con movimiento reducido
│   │   └── site/                 Secciones de la página pública
│   ├── content/site-content.ts   Contenido inicial y de respaldo
│   ├── lib/
│   │   ├── brand.ts              Geometría del monograma (fuente de verdad)
│   │   ├── contact.ts            Enlaces de WhatsApp y correo
│   │   ├── data.ts               Lectura de contenido y caché
│   │   ├── schemas.ts            Validación con Zod
│   │   ├── site.ts               URL canónica y secciones
│   │   └── supabase/             Clientes de navegador, servidor y middleware
│   └── middleware.ts             Refresco de sesión y protección de /admin
├── supabase/migrations/          Esquema, políticas RLS y seed
└── tests/
    ├── e2e/                      Pruebas de humo con Playwright
    └── unit/                     Pruebas unitarias y de componentes
```

---

## Instalación y desarrollo local

Requisitos: **Node.js 20.11 o superior** (se recomienda 22) y npm.

```bash
git clone https://github.com/M1gu3hb/Vero-seguros-.git
cd Vero-seguros-
npm install
cp .env.example .env.local     # completa los valores
npm run dev                    # http://localhost:3000
```

El administrador vive en <http://localhost:3000/admin>.

### Comandos disponibles

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | Comprobación de tipos de TypeScript |
| `npm run test` | Pruebas unitarias y de componentes |
| `npm run test:e2e` | Pruebas end-to-end (levanta la app si hace falta) |
| `npm run verify` | Lint + tipos + pruebas + build, en ese orden |

---

## Variables de entorno

Copia `.env.example` a `.env.local`.

| Variable | Obligatoria | Para qué sirve |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Recomendada | URL canónica para metadatos, Open Graph, `sitemap.xml` y `robots.txt`. En Vercel, si no se define, se usa el dominio de producción del proyecto. |
| `NEXT_PUBLIC_SUPABASE_URL` | No | URL del proyecto de Supabase. Si no se define se usa el proyecto de producción. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Clave pública de Supabase. Igual que la anterior. |
| `SUPABASE_SERVICE_ROLE_KEY` | No | **No la usa la aplicación.** Sólo para tareas de mantenimiento por línea de comandos. Nunca debe llevar el prefijo `NEXT_PUBLIC_` ni llegar al navegador. |
| `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` | No | Credenciales de prueba para ejecutar también las pruebas end-to-end del CMS con sesión. |

> **Sobre la URL y la clave `anon` de Supabase.** Son valores públicos por
> diseño: viajan al navegador en cualquier aplicación de Supabase y lo único
> que permiten es hablar con la API respetando Row Level Security. No dan
> acceso de escritura. Por eso el repositorio incluye los valores del proyecto
> de producción como respaldo en `src/lib/supabase/config.ts`, y las variables
> de entorno sirven para apuntar a otro proyecto sin tocar el código.
>
> Lo que **nunca** debe estar en el repositorio ni en el navegador es la
> `service role key`, ninguna contraseña y ningún archivo `.env`.

---

## Supabase: base de datos, migraciones y almacenamiento

### Modelo de datos

| Tabla | Contenido |
| --- | --- |
| `site_settings` | Fila única (`id = 1`) con identidad, contacto, inicio, biografía y promociones |
| `services` | Los ramos de seguro: nombre, slug, descripción, icono, orden y visibilidad |
| `insurers` | Las aseguradoras: nombre, logotipo opcional, orden y visibilidad |
| `admin_users` | Los usuarios autorizados a editar |

Además:

- La función `public.is_admin()` (`security definer`, con `search_path` fijo)
  comprueba la pertenencia a `admin_users` sin provocar recursión en las
  políticas.
- Todas las tablas tienen **RLS activo**. El público sólo lee lo publicado
  (`is_visible`); la escritura exige `is_admin()`.
- Un disparador mantiene `updated_at` al día y hay índices por `sort_order` y
  por visibilidad.
- El bucket `site-media` es de lectura pública y escritura sólo para
  administradoras, con un límite de 3 MB y tipos restringidos a JPG, PNG, WebP
  y AVIF.

### Aplicar las migraciones

Los archivos viven en `supabase/migrations/` y son idempotentes:

| Archivo | Contenido |
| --- | --- |
| `0001_schema.sql` | Tablas, función `is_admin()`, disparadores, índices, políticas RLS y bucket |
| `0002_seed.sql` | Contenido inicial: ajustes, ocho servicios y diez aseguradoras |

Con la CLI de Supabase:

```bash
supabase link --project-ref <tu-project-ref>
supabase db push
```

O bien, desde el panel de Supabase, pegando cada archivo en el **SQL Editor** y
ejecutándolos en orden.

El mismo contenido inicial está en `src/content/site-content.ts`, que además
sirve de respaldo visual si la base de datos no responde.

---

## Crear la primera administradora

No hay registro público: el alta es manual y deliberada.

1. En el panel de Supabase entra en **Authentication → Users → Add user**.
2. Crea el usuario con su correo y una contraseña, y marca **Auto Confirm User**
   (si no, no podrá entrar hasta confirmar por correo).
3. Copia el **UUID** del usuario recién creado.
4. En **SQL Editor**, agrégalo a la lista de administradoras:

   ```sql
   insert into public.admin_users (user_id, email)
   values ('PEGA-AQUÍ-EL-UUID', 'correo@ejemplo.com')
   on conflict (user_id) do nothing;
   ```

5. Entra en `/admin/login` con ese correo y contraseña.
6. En la pestaña **Tu cuenta**, cambia la contraseña por una propia.

Para comprobar quién tiene acceso:

```sql
select a.email, a.created_at
from public.admin_users a
order by a.created_at;
```

Para retirar el acceso a alguien basta con borrar su fila de `admin_users`: el
usuario seguirá existiendo, pero `is_admin()` devolverá `false` y las políticas
RLS bloquearán cualquier escritura.

---

## Pruebas

```bash
npm run test        # unitarias y de componentes (Vitest + Testing Library)
npm run test:e2e    # humo end-to-end (Playwright)
npm run verify      # lint + tipos + pruebas + build
```

**Unitarias y de componentes** — construcción de los enlaces de WhatsApp y
correo, validación de todos los esquemas, integridad del contenido inicial
(identidad confirmada, ocho ramos, diez aseguradoras, sin llamadas agresivas y
sin el número escrito) y renderizado de las secciones, incluidos los casos con
cero o un solo servicio.

**End-to-end** — se ejecutan en tres anchos (360, 768 y 1440 px) y comprueban:

- que la página renderiza el contenido inicial y las anclas existen;
- que el enlace de WhatsApp lleva el número y el mensaje correctos;
- que el número **no** aparece escrito en ninguna parte;
- que el correo abre `mailto:`;
- que no hay desplazamiento horizontal ni errores de consola;
- que el menú móvil se abre, navega y se cierra con `Escape`;
- que con movimiento reducido el contenido sigue siendo legible;
- que un visitante sin sesión es enviado a `/admin/login`;
- que el administrador no se indexa;
- que **un usuario no autorizado no puede escribir en la base de datos**;
- que se sirven `robots.txt`, `sitemap.xml` y las cabeceras de seguridad.

Si defines `E2E_ADMIN_EMAIL` y `E2E_ADMIN_PASSWORD`, se ejecutan además las
pruebas con sesión: editar un texto, comprobar que persiste tras recargar, que
aparece en el sitio público, que eliminar pide confirmación y que se puede
cerrar sesión.

**Integración continua** — `.github/workflows/ci.yml` ejecuta instalación,
lint, tipos, pruebas, build y las pruebas end-to-end en cada push a `main` y en
cada pull request.

---

## Build y despliegue

```bash
npm run build
npm run start
```

### Vercel

El proyecto está pensado para desplegarse desde GitHub:

1. En Vercel, **Add New → Project** e importa `M1gu3hb/Vero-seguros-`.
2. Framework: **Next.js** (se detecta solo). No hace falta cambiar los comandos.
3. Rama de producción: **`main`**.
4. En **Settings → Environment Variables**, define al menos:

   ```
   NEXT_PUBLIC_SITE_URL = https://tu-dominio.vercel.app
   ```

   Y, si quieres apuntar a otro proyecto de Supabase, también
   `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. **Deploy**. Cada push a `main` publica una nueva versión.

Después del primer despliegue conviene actualizar `NEXT_PUBLIC_SITE_URL` con la
URL definitiva para que el canonical, el `sitemap.xml` y las tarjetas de
Open Graph apunten al sitio correcto.

---

## Mantenimiento del contenido

Todo se hace desde `/admin`, sin tocar código:

1. Entra en `/admin/login` con tu correo y contraseña.
2. Elige la sección en el menú lateral.
3. Modifica los textos. Los campos avisan del largo permitido y marcan los
   errores.
4. Pulsa **Guardar cambios**. Mientras haya cambios pendientes verás el aviso
   «Tienes cambios sin guardar», y al terminar aparece la confirmación.
5. Los cambios se ven en el sitio público de inmediato.

Detalles útiles:

- **Fotografía.** Cuando subas una foto tuya en «Inicio» o «Sobre Verónica»,
  sustituirá al monograma. Se recomienda una imagen vertical (4:5), de al menos
  320 px por lado y menos de 3 MB. El diseño funciona igual de bien sin foto.
- **Servicios y aseguradoras.** Usa las flechas para reordenar; el orden se
  guarda solo. «Ocultar» los quita del sitio sin borrarlos; «Eliminar» pide
  confirmación y no se puede deshacer.
- **Logotipos de aseguradoras.** El proyecto incluye los logotipos oficiales de
  nueve de ellas en `public/brand/aseguradoras/`. Si una marca no tiene
  logotipo cargado se muestra su nombre en tipografía, que es la presentación
  por omisión. Para añadir o sustituir uno, súbelo desde el CMS.
- **Promociones.** Puedes ocultar toda la sección si en algún momento deja de
  haber facilidades vigentes.

---

## Decisiones de diseño

La identidad se reconstruyó a partir de la tarjeta de presentación de Verónica,
no se inventó:

- **El monograma VM** se redibujó como SVG limpio: letras serif de alto
  contraste (tipo Didone), serifas planas y delgadas, y el entrelace en el punto
  donde la serifa del asta fina de la V toca la del asta izquierda de la M. La
  geometría vive en `src/lib/brand.ts` y de ahí se generan los archivos de
  `public/brand/` con `node scripts/generate-brand-assets.mjs`.
- **La curva de la tarjeta** se convirtió en el elemento gráfico recurrente:
  separa secciones, envuelve el hero y enlaza los tres pasos del proceso.
- **La paleta** sale de la tarjeta: azul marino `#13315C`, crema cálido
  `#F8EFE6`, dorado mate `#BF9D5B` y azul grisáceo `#6C819C`.
- **La tipografía** combina Newsreader (serif editorial, también en cursiva para
  la frase de marca) con Manrope (sans humanista). Dos familias, ninguna más.
- **El movimiento** es discreto y siempre respeta `prefers-reduced-motion`. La
  garantía la da el CSS, no JavaScript: `[data-reveal]`, `[data-parallax]` y
  `[data-draw]` se fijan en su estado final con `!important`, que gana a los
  estilos en línea de la librería de animación. Así el contenido nunca depende
  de que un hook se haya inicializado a tiempo ni de la hidratación.

### Logotipos de las aseguradoras

Los logotipos que vienen con el proyecto son **archivos oficiales de cada
marca**, no versiones redibujadas: ocho proceden de Wikimedia Commons y el de
VRIM de su propio sitio. Están en `public/brand/aseguradoras/`.

Cada archivo se normalizó a un lienzo común de 120 unidades de alto, con una
escala óptica por marca (`0.66` para el bloque macizo de Chubb, `1.00` para
MAPFRE, etc.). Sin ese ajuste, a la misma altura bruta un cuadrado sólido pesa
mucho más que un logotipo ancho de trazo fino y la cinta se ve desordenada.

Los logotipos son marcas registradas de sus titulares. Se muestran para
identificar a las aseguradoras con las que Verónica trabaja; el sitio no
sugiere en ningún momento que ellas lo patrocinen o lo certifiquen, y la nota
de la sección lo deja claro. Si alguna marca pide retirarlo, basta con quitar
la imagen desde el CMS: la aseguradora seguirá apareciendo con su nombre.

Accesibilidad y rendimiento: HTML semántico, jerarquía correcta de encabezados,
navegación completa por teclado, foco siempre visible, contraste AA, diálogos
accesibles con retorno del foco, imágenes con texto alternativo editable,
tipografía fluida y componentes de servidor siempre que es posible.
