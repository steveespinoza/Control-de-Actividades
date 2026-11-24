# Fuera de alcance — Control de Actividades

Este documento reúne lo que no se implementará en el MVP definido en [Alcance del MVP](Alcance-MVP.md). El producto se concentra en crear tareas personales, moverlas dentro de las reglas del tablero, conservar sus cambios y consultar el avance semanal.

Las exclusiones delimitan esta entrega. No representan funcionalidades desarrolladas, compromisos para una versión posterior ni motivos para ampliar el proyecto durante la implementación.

## Funciones excluidas

| Área | Qué queda fuera |
| --- | --- |
| Cuentas y colaboración | Registro de usuarios, inicio de sesión, roles, equipos, asignación de tareas a otras personas y colaboración entre usuarios. Durante el desarrollo, solo el autor tiene acceso al sistema. |
| Edición y retiro de tareas | Cambiar el título después de crear una tarea, eliminarla o archivarla. Los requisitos actuales contemplan su creación y cambio de estado. |
| Reapertura | Devolver una tarea de **Completadas** a **Pendiente** o **En curso**, deshacer su finalización o cambiar su fecha de finalización. Completar es un cierre definitivo. |
| Información adicional | Prioridades, etiquetas, fechas límite, subtareas, comentarios y archivos adjuntos. La configuración prevista de S3 no incorpora una función de archivos al MVP. |
| Automatizaciones e integraciones | Recordatorios, notificaciones, tareas recurrentes e integraciones con otros servicios. |
| Vistas e informes adicionales | Calendario, reportes imprimibles y estadísticas distintas del conteo semanal de tareas completadas. |
| Sincronización | Compartir o sincronizar tareas entre navegadores, dispositivos o usuarios. La aplicación conserva sus datos en localStorage para el mismo navegador y sitio desde el inicio. |
| Intercambio, respaldos y restauración | Importación, exportación, respaldos manuales o automáticos y restauración. Si se borran los datos del navegador, la aplicación no recuperará las tareas. |
| Otras formas de distribución | Aplicaciones nativas y un modo sin conexión completo. La persistencia en localStorage no incluye por sí sola la carga de la aplicación sin conexión. |

## Límites que deben respetarse

- **localStorage se utiliza desde el inicio del desarrollo.** Todas las tareas se guardan en el navegador y sitio utilizados.
- **La capacidad de En curso se mantiene en 10 tareas.** No se incluye una pantalla para configurar ese máximo.
- **Las 200 tareas son el volumen de evaluación de rendimiento.** No se ha definido una regla que impida crear otra tarea al llegar a esa cantidad, ni un compromiso de rendimiento para volúmenes mayores.
- **El avance semanal es un conteo.** No incorpora horas trabajadas, porcentajes de productividad ni indicadores de desempeño adicionales.

## Pérdida de datos del navegador

No se implementarán respaldos ni restauración. Si se borran los datos del sitio o del navegador, las tareas se pierden para la aplicación y no se recuperarán desde otra copia.

La persistencia al recargar o volver a abrir exige que los datos locales se mantengan. Las reglas de integridad y manejo de errores de los [requisitos no funcionales](../02-Requisitos/Requisitos-No-Funcionales.md) siguen vigentes.

## Cambios de alcance

Para incorporar una función excluida, debe acordarse su comportamiento y actualizar los [requisitos funcionales](../02-Requisitos/Requisitos-Funcionales.md), las condiciones de calidad afectadas y el alcance del MVP. La presencia de una tecnología o de una dependencia en el proyecto no autoriza por sí sola esa ampliación.
