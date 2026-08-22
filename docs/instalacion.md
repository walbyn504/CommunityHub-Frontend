# Instalación y ejecución

## Requisitos

- Node.js compatible con Nuxt 4.
- npm.
- El backend de CommunityHub disponible para consumir su API REST.

## Configuración local

1. Clonar el repositorio y entrar en su directorio.
2. Instalar las dependencias:

   ```bash
   npm install
   ```

3. Crear un archivo `.env` a partir de `.env.example`:

   ```env
   PORT=3001
   NUXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
   ```

   `PORT` define el puerto del frontend. `NUXT_PUBLIC_API_BASE_URL` debe apuntar
   a la URL base de la API del backend, incluyendo el prefijo `/api`.

4. Iniciar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

5. Abrir `http://localhost:3001` en el navegador.

## Compilación de producción

```bash
npm run build
npm run preview
```

La compilación genera la aplicación de Nuxt y los archivos de la PWA, incluido
el Service Worker. La PWA está desactivada durante `npm run dev`, por lo que sus
funciones deben probarse con la compilación de producción.

## Variables y secretos

El frontend solo expone variables con el prefijo `NUXT_PUBLIC_`. No se deben
guardar tokens, credenciales de MongoDB ni claves de AWS en este repositorio.
El archivo `.env` está destinado al entorno local y no debe versionarse.

## Comandos disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia Nuxt en modo desarrollo. |
| `npm run build` | Genera la compilación de producción. |
| `npm run preview` | Ejecuta localmente la compilación generada. |
| `npm run generate` | Genera una salida estática cuando la configuración lo permite. |

