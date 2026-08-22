# Arquitectura del frontend

## Tecnologías

- Nuxt 4 y Vue 3 para la aplicación y el renderizado.
- TypeScript para tipado estático.
- Pinia para el estado global de autenticación.
- `$fetch` de Nuxt para consumir la API REST.
- Tailwind CSS y Nuxt UI para estilos y componentes visuales.
- Chart.js y vue-chartjs para los gráficos de los dashboards.
- `@vite-pwa/nuxt` y Workbox para las capacidades PWA.

## Flujo de datos

```text
Página o componente
        |
        v
Composable del dominio
        |
        v
useApi ($fetch + JWT)
        |
        v
API REST de Express
```

Las páginas no acceden a MongoDB ni a servicios AWS directamente. Los
composables agrupan las operaciones de cada dominio y `useApi` centraliza la
URL base, el encabezado de autorización y la normalización de errores.

## Organización del código

```text
app/
├── assets/       Estilos globales
├── components/   Componentes reutilizables
├── composables/  Acceso a la API por dominio
├── layouts/      Estructuras visuales compartidas
├── middleware/   Protección de rutas y autorización
├── pages/        Rutas generadas por Nuxt
├── plugins/      Inicialización de la sesión
├── stores/       Estado global de Pinia
├── types/        Contratos TypeScript
└── utils/        Validación y utilidades generales
```

## Autenticación y autorización

El JWT se conserva en la cookie de sesión `chub_token`. El cliente HTTP añade
el encabezado `Authorization: Bearer <token>` cuando existe una sesión. Al
iniciar la aplicación, el plugin de autenticación consulta `/auth/me` para
restaurar el usuario actual.

La interfaz aplica middleware de rutas:

| Middleware | Responsabilidad |
| --- | --- |
| `guest` | Evita que usuarios autenticados entren a login o registro. |
| `auth` | Exige una sesión válida. |
| `admin` | Restringe la ruta al rol `ADMIN`. |
| `organizer` | Permite los roles `ORGANIZER` y `ADMIN`. |
| `organizer-only` | Restringe la ruta al rol `ORGANIZER`. |

Estas comprobaciones mejoran la navegación, pero la autorización definitiva
de cada operación debe realizarse también en el backend.

## Rutas principales

| Ruta | Acceso | Propósito |
| --- | --- | --- |
| `/` | Público | Página inicial. |
| `/login` y `/register` | Invitado | Autenticación y creación de cuenta. |
| `/events` y `/events/:id` | Público | Consulta de actividades. |
| `/dashboard` | Autenticado | Dashboard del usuario. |
| `/organizer/dashboard` | Organizador | Dashboard del organizador. |
| `/my-events` | Organizador o administrador | Gestión de actividades propias. |
| `/favorites` | Autenticado | Actividades favoritas. |
| `/my-registrations` | Autenticado | Inscripciones del usuario. |
| `/notifications` | Autenticado | Notificaciones. |
| `/profile` | Autenticado | Perfil del usuario. |
| `/admin/*` | Administrador | Usuarios, actividades, categorías y estadísticas. |

## Manejo de errores

`useApi` convierte las respuestas fallidas del backend en instancias de
`ApiError`. Esto permite que las páginas muestren mensajes controlados sin
exponer respuestas internas del servidor o de la base de datos.

