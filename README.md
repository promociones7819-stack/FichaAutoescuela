# Ficha Autoescuela

PWA local optimizada para iPad/Mac basada en los cuadernillos de seguimiento de la DGT.

## Incluye
- Alumnos sin fotografías.
- Uno o varios permisos por alumno.
- AM, A1/A2, B, C1/C y D1/D.
- Ficha teórica con validaciones táctiles.
- Ficha práctica con progreso 1–5.
- Histórico de clases con fecha, duración, itinerario, notas y captura del estado de valoración.
- Evolución gráfica global y por aprendizaje.
- Generación de PDF partiendo del PDF oficial original de la DGT.
- Superposición de alumno, profesor, fecha y valoraciones 1–5 sobre las casillas de la ficha oficial.
- Página final de histórico de clases.
- Guardado 100% local de los datos personales.
- Sincronización sin servidor mediante exportar/importar una copia JSON usando AirDrop, iCloud Drive o Archivos.
- PWA/offline para iPad y Mac.

## Sincronización iPad / Mac sin servidor
Una web app pura no puede sincronizar automáticamente dos navegadores sin un punto compartido. Para mantener los datos fuera de un servidor, esta versión usa copias portátiles JSON y fusión por `updatedAt`.

Puedes mover el archivo mediante AirDrop, iCloud Drive o la app Archivos. Los datos de los alumnos no se envían a Cloudflare ni a la DGT.

## PDF oficial
La ruta `/api/dgt-pdf` es una Cloudflare Pages Function que obtiene únicamente el cuadernillo oficial correspondiente desde la DGT. Los datos personales no se envían a esa Function.

El rellenado se realiza en el navegador con `pdf-lib`: se conserva el cuadernillo oficial completo y se superponen las valoraciones en las casillas de progreso de las páginas prácticas. El archivo `pdf-enhance.js` contiene la calibración de coordenadas para AM, A1/A2, B, C1/C y D1/D.

## Despliegue en Cloudflare Pages
Conecta este repositorio a Cloudflare Pages.

Configuración recomendada:
- Framework preset: `None`
- Build command: dejar vacío
- Build output directory: `.`
- Root directory: `/`

Cloudflare detectará automáticamente `functions/api/dgt-pdf.js` como Pages Function.

El archivo `wrangler.toml` deja preparado el proyecto para trabajar también con Wrangler.
