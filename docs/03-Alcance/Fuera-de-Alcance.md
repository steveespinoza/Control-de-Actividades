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
| Sincronización | Compartir o sincronizar tareas entre navegadores, dispositivos o usuarios. La versión final conserva sus datos en localStorage para el mismo navegador y sitio. |
| Intercambio y copias automáticas | Importación, exportación y respaldos automáticos. No hay una función de transferencia o copia de tareas comprometida en esta entrega. |
| Datos de desarrollo | Conservar o migrar a localStorage las tareas existentes en Supabase. Esos datos no forman parte de la entrega final. |
| Otras formas de distribución | Aplicaciones nativas y un modo sin conexión completo. La persistencia en localStorage no incluye por sí sola la carga de la aplicación sin conexión. |

## Límites que deben respetarse

- **Supabase se utiliza durante el desarrollo.** La versión final guarda todas las tareas en **localStorage** y no utiliza Supabase para persistir o sincronizar el tablero.
- **La capacidad de En curso se mantiene en 10 tareas.** No se incluye una pantalla para configurar ese máximo.
- **Las 200 tareas son el volumen de evaluación de rendimiento.** No se ha definido una regla que impida crear otra tarea al llegar a esa cantidad, ni un compromiso de rendimiento para volúmenes mayores.
- **El avance semanal es un conteo.** No incorpora horas trabajadas, porcentajes de productividad ni indicadores de desempeño adicionales.

## Disponibilidad y recuperación: definición diferida

La disponibilidad y la recuperación de datos se abordarán al comenzar la implementación de **localStorage**, según los [requisitos no funcionales](../02-Requisitos/Requisitos-No-Funcionales.md). No se fija todavía una política de disponibilidad, respaldo o restauración.

Esta definición no bloquea el desarrollo con Supabase. Los requisitos vigentes de persistencia, integridad y manejo de errores se mantienen. Si al definir la recuperación se necesita una función que hoy está excluida, deberá actualizarse expresamente el alcance antes de incorporarla.

## Cambios de alcance

Para incorporar una función excluida, debe acordarse su comportamiento y actualizar los [requisitos funcionales](../02-Requisitos/Requisitos-Funcionales.md), las condiciones de calidad afectadas y el alcance del MVP. La presencia de una tecnología o de una dependencia en el proyecto no autoriza por sí sola esa ampliación.
