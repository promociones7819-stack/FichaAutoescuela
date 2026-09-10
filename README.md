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
- Plantillas PDF oficiales incluidas.
- Generación de PDF partiendo del PDF oficial original como plantilla.
- Guardado 100% local.
- Sincronización sin servidor mediante exportar/importar una copia JSON usando AirDrop, iCloud Drive o Archivos.
- PWA/offline para iPad y Mac.

## Sincronización
Una web app pura no puede sincronizar automáticamente datos entre Safari de iPad y Mac sin utilizar algún servicio o servidor compartido. Para mantener el requisito de no usar servidor externo, esta versión usa copias portátiles y fusión por `updatedAt`.
Esto permite mover el fichero de datos por AirDrop/iCloud Drive/Archivos sin enviar los datos de alumnos a la aplicación ni a terceros.

## PDF
Los PDFs originales oficiales están en `/templates`.
La aplicación carga el PDF oficial y superpone datos, conservando las páginas oficiales. Además añade una página final con el histórico de clases.

## Despliegue Cloudflare
El proyecto es estático. Puede desplegarse directamente en Cloudflare Pages.
No requiere base de datos ni Functions para el modo local.
