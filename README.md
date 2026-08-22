# CommunityHub Frontend

Frontend de CommunityHub, una plataforma comunitaria para publicar, descubrir
y gestionar actividades y eventos. La aplicación ofrece experiencias para
usuarios, organizadores y administradores, consume una API REST independiente
y puede instalarse como Progressive Web App (PWA).

## Funcionalidades

- Registro, autenticación y gestión del perfil.
- Consulta de actividades con búsqueda y filtros.
- Inscripciones, favoritos y notificaciones.
- Gestión de actividades para organizadores.
- Administración de usuarios, actividades y categorías.
- Dashboards y estadísticas según el rol.
- Consulta offline de actividades cargadas previamente.
- Interfaz adaptable a dispositivos móviles y escritorio.

## Tecnologías

Nuxt 4, Vue 3, TypeScript, Pinia, Tailwind CSS, Nuxt UI, Chart.js,
vue-chartjs, Vite PWA y Workbox.

## Inicio rápido

Requiere Node.js 22, npm y el backend de CommunityHub disponible.

```bash
git clone https://github.com/walbyn504/CommunityHub-Frontend.git
cd CommunityHub-Frontend
npm install
```

Crea `.env` a partir de `.env.example`:

```env
PORT=3001
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

Inicia el entorno de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3001`.

## Producción

```bash
npm run build
npm run preview
```

La PWA y el funcionamiento offline se habilitan en la compilación de
producción; están desactivados durante `npm run dev`.

## Comandos

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia Nuxt en modo desarrollo. |
| `npm run build` | Genera la aplicación de producción. |
| `npm run preview` | Ejecuta localmente la compilación generada. |
| `npm run generate` | Genera una salida estática. |

## Documentación

- [Índice de documentación](docs/README.md)
- [Instalación y ejecución](docs/instalacion.md)
- [Arquitectura del frontend](docs/arquitectura.md)
- [Progressive Web App](docs/pwa.md)

El backend, la base de datos y la función AWS Lambda se mantienen en
repositorios separados.

## Autores

- Seidy Alanis
- Walbyn

## Licencia

Este proyecto se distribuye bajo la [licencia MIT](LICENSE).
