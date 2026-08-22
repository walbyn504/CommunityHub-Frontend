# Progressive Web App

CommunityHub utiliza `@vite-pwa/nuxt` para generar el Web App Manifest y el
Service Worker durante la compilación de producción.

## Manifest

La configuración del manifest se encuentra en `nuxt.config.ts` e incluye:

- Nombre y nombre corto: CommunityHub.
- Descripción de la aplicación.
- Ruta inicial `/`.
- Modo de visualización `standalone`.
- Colores de tema y fondo.
- Iconos de 192 y 512 píxeles.
- Icono maskable de 512 píxeles.

Los recursos gráficos están almacenados en `public/icons/`.

## Service Worker y caché

Workbox genera `sw.js` con cada compilación de producción. La estrategia
configurada para las respuestas de la API es `NetworkFirst`:

1. El Service Worker intenta obtener la respuesta desde la red.
2. Si la solicitud funciona, actualiza la caché.
3. Si la red no está disponible, intenta responder con una copia almacenada.

La caché `communityhub-api-cache` conserva hasta 100 respuestas durante un
máximo de 24 horas. Solo incluye consultas públicas de actividades y
categorías; las sesiones, perfiles, usuarios y dashboards no se almacenan. Los
archivos JavaScript, CSS, imágenes, fuentes y otros recursos estáticos
generados también se incluyen en el precache.

La URL que intercepta Workbox se construye con
`NUXT_PUBLIC_API_BASE_URL`, por lo que funciona tanto con el backend local como
con la URL configurada al compilar para producción.

## Estado de conexión

`NetworkStatusBanner` escucha los eventos `online` y `offline` del navegador.
Cuando se pierde la conexión muestra un aviso global en la parte inferior de
la aplicación. El aviso también utiliza una región de estado accesible para
lectores de pantalla.

## Actualizaciones

La opción `registerType: autoUpdate` permite actualizar automáticamente el
Service Worker. El cliente comprueba periódicamente si existe una versión
nueva de la aplicación.

## Prueba local

La PWA está desactivada en desarrollo para evitar registros inestables del
Service Worker. Para probarla:

```bash
npm run build
npm run preview
```

Después, desde las herramientas del navegador:

1. Abrir la sección **Application**.
2. Confirmar que el manifest carga correctamente.
3. Confirmar que `sw.js` está registrado.
4. Navegar por las actividades para generar respuestas en caché.
5. Activar el modo **Offline** y volver a consultar contenido previamente
   cargado.

Los Service Workers requieren HTTPS, excepto en `localhost`, donde el navegador
permite utilizarlos para desarrollo y pruebas.

## Limitaciones actuales

- Solo puede consultarse offline contenido público que haya sido solicitado y
  guardado previamente en la caché.
- Las operaciones que modifican datos, como inscripciones y favoritos,
  requieren conexión y no se ponen en cola para ejecutarse posteriormente.
- La primera carga de la aplicación debe realizarse con conexión para instalar
  el Service Worker y descargar los recursos iniciales.
