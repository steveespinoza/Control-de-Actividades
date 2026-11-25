# Alcance del MVP — Control de Actividades

## Propósito

La primera versión permite a una sola persona centralizar sus pendientes, limitar el trabajo en curso y reconocer lo que termina cada semana. El usuario entra directamente al tablero, sin iniciar sesión.

Este alcance reúne lo definido en [Problema y objetivo](../00-Inicio/Problema-y-Objetivo.md), los [requisitos funcionales](../02-Requisitos/Requisitos-Funcionales.md) y los [requisitos no funcionales](../02-Requisitos/Requisitos-No-Funcionales.md). Describe la entrega prevista; no acredita funcionalidades implementadas ni sustituye su validación.

## Funciones incluidas

| Función | Qué incluye | Referencia |
| --- | --- | --- |
| Tablero personal | Consultar las tareas en **Pendiente**, **En curso** y **Completadas**, con sus títulos visibles y acceso directo al abrir la aplicación. | RF-01 |
| Creación de tareas | Registrar un título no vacío y guardar la nueva tarea en **Pendiente**. | RF-02 |
| Cambio de estado | Mover tareas pendientes o en curso entre las columnas. Una tarea que llega a **Completadas** queda cerrada y no puede reabrirse. | RF-03 |
| Límite de trabajo en curso | Admitir hasta **10 tareas** en **En curso**, mostrar la ocupación y rechazar movimientos que superen ese máximo. | RF-04 |
| Persistencia | Conservar títulos, estados y fechas de finalización en localStorage al recargar o volver a abrir la aplicación, mientras se mantengan los datos del navegador. | RF-05 |
| Avance semanal | Consultar cuántas tareas se completaron en la semana correspondiente, mostrando el intervalo de fechas y **0** cuando no hubo finalizaciones. | RF-06 |

Los errores de carga o guardado deben comunicarse sin presentar una operación fallida como exitosa ni perder o duplicar tareas por un movimiento.

## Reglas que delimitan la versión

- Hay un solo actor: el [Usuario](../01-Usuarios/Rol%20-%20Usuario.md) que organiza sus pendientes personales. No hay gestión de equipos ni asignación de tareas a otras personas.
- Cada tarea pertenece a una sola columna. Las tareas completadas conservan su fecha de finalización y no vuelven a **Pendiente** ni a **En curso**.
- El límite de 10 se aplica únicamente a **En curso**. Alcanzarlo no impide crear tareas pendientes ni sacar tareas de esa columna.
- Cada tarea cuenta una sola vez en la semana en que se completó. La semana comienza el **lunes a las 00:00 en America/Lima (Perú)** y termina al comenzar el lunes siguiente, sin incluir ese instante.
- Las **200 tareas totales** son el volumen de referencia para evaluar rendimiento, sumando las tres columnas. No se ha definido un bloqueo de creación al llegar a esa cantidad.

## Almacenamiento local desde el inicio

Todas las tareas se guardan en **localStorage desde el inicio del desarrollo**, incluidas las completadas. Se conservan títulos, estados y fechas de finalización al recargar o volver a abrir la aplicación en el mismo navegador y sitio, siempre que sus datos locales se mantengan.

El cambio de estado de una tarea no cambia su almacenamiento.

No hay sincronización entre navegadores o dispositivos. **No se implementan respaldos ni restauración:** si se borran los datos del sitio o del navegador, las tareas se pierden para la aplicación.

Se conservan las tecnologías y la configuración existentes descritas en el [README](../../README.md). La presencia de S3 en el proyecto no incorpora funciones adicionales al producto.

## Fuera del alcance de esta entrega

Las funciones y condiciones excluidas se detallan en [Fuera de alcance](Fuera-de-Alcance.md). Esas exclusiones no son un plan de funciones futuras. Cualquier ampliación requiere una nueva definición de alcance.

## Criterios para considerar terminada la entrega

La aprobación integral requiere completar los puntos siguientes. Las marcas reflejan los resultados comprobados en los entornos documentados; no extienden esa evidencia a todos los navegadores y dispositivos. El cierre del desarrollo funcional se registra por separado más abajo.

- [x] Se puede abrir el tablero, crear tareas, moverlas dentro de las reglas y consultar el avance semanal, conforme a RF-01 a RF-06.
- [x] El máximo de 10 tareas en curso y la prohibición de reapertura se mantienen también ante operaciones desde dos pestañas; los reintentos no duplican tareas ni finalizaciones.
- [x] La aplicación recupera sus datos desde localStorage al recargar y volver a abrir en el mismo navegador y sitio, mientras se mantengan sus datos locales.
- [x] El conteo semanal utiliza Lima y clasifica correctamente las finalizaciones a ambos lados del lunes a las 00:00.
- [ ] La carga del tablero, la creación, los cambios de columna y la consulta semanal cumplen el máximo de **3 segundos**, con el volumen de **200 tareas** y las condiciones de **Wi-Fi o 4G** de RNF-04.
- [ ] Se verifica el uso en computadoras y dispositivos móviles, con teclado, ratón e interacción táctil según corresponda. Se documenta la matriz de pruebas respecto al objetivo de las **tres últimas versiones estables de todos los navegadores**; las combinaciones no probadas quedan identificadas.
- [ ] Se revisan los demás criterios de calidad de RNF-01 a RNF-08 y se registran los resultados, las limitaciones y los pendientes que afecten a la entrega.
- [x] `npm run lint`, `npm run typecheck` y `npm run build` terminan correctamente. Estas comprobaciones complementan las pruebas de uso y de datos.
- [x] La documentación permite preparar y ejecutar el proyecto y describe localStorage como almacenamiento desde el inicio.
- [x] La documentación indica que no hay respaldos ni restauración si se borran los datos del navegador.

## Cierre funcional

El **25 de noviembre de 2026** cierro el desarrollo funcional del MVP con RF-01 a RF-06 implementados: tablero, registro, movimientos, máximo de diez tareas en curso, cierre definitivo, persistencia local y avance semanal en su propia vista. La versión conserva el alcance personal, sin cuentas, sincronización, respaldos ni restauración.

La evidencia comprende **96 pruebas automatizadas aprobadas**, lint, tipos y compilación, además de los recorridos locales de datos, concurrencia y uso descritos en las historias. La [revisión actual de contraste y accesibilidad](../07-Interfaz/Pantallas.md#contraste-y-accesibilidad-actual) registra las mediciones de la paleta, las correcciones de foco y los recorridos en 1280, 390 y 320 px, incluidos errores controlados y listas de 200 tareas.

La aceptación integral de calidad continúa pendiente de:

- Medir el máximo de 3 segundos con 200 tareas en las condiciones reales de Wi-Fi y 4G de RNF-04.
- Completar la matriz de versiones y sistemas, con dispositivos móviles e interacción táctil real.
- Validar el uso con los pendientes personales del usuario, conforme a RNF-01.
- Realizar las comprobaciones manuales pendientes de lector de pantalla hablado, zoom real y alto contraste del sistema.

Estos puntos permanecen identificados como no verificados. El cierre funcional no acredita despliegue, certificación WCAG ni cumplimiento de todas las condiciones de aceptación del MVP.

## Conservación y pérdida de datos

Los datos permanecen en el mismo navegador y sitio mientras se conserven sus datos locales. Borrarlos implica perder las tareas para la aplicación. No habrá respaldos ni restauración.

Se mantienen las obligaciones de informar errores de lectura o escritura y de preservar la integridad de los cambios confirmados. La ausencia de respaldos no permite tratar un fallo de lectura como un tablero vacío ni confirmar un guardado fallido.

## Estado actual

El desarrollo funcional está cerrado según el registro anterior. El repositorio contiene la consulta de HU-01, el registro de HU-02, los movimientos entre Pendiente y En curso de HU-03 y la finalización de HU-05. Los cambios se muestran después del guardado y comparten un bloqueo entre pestañas; los ingresos a En curso respetan el máximo de diez y el cierre guarda estado y fecha juntos. HU-07 incorpora el avance semanal con intervalo, conteo y navegación entre semanas. Las verificaciones y sus límites están en [HU-01](../04-Casos%20de%20Uso/HU-01.%20Consultar%20mi%20tablero.md#verificación-de-esta-entrega), [HU-02](../04-Casos%20de%20Uso/HU-02.%20Registrar%20un%20pendiente.md#verificación-en-navegador-y-pendientes), [HU-03](../04-Casos%20de%20Uso/HU-03.%20Actualizar%20lo%20que%20estoy%20haciendo.md#verificación-en-navegador-y-pendientes) y [HU-05](../04-Casos%20de%20Uso/HU-05.%20Completar%20una%20tarea.md#verificación-en-navegador-y-pendientes); la aceptación integral de calidad sigue pendiente.

La [revisión por criterio de HU-04](../04-Casos%20de%20Uso/HU-04.%20Limitar%20mi%20trabajo%20en%20curso.md#revisión-por-criterio-de-aceptación) identifica la cobertura del límite. Con HU-05 se comprobó la salida a Completadas y la creación con En curso lleno. La contención real de dos ingresos desde nueve en curso ya se comprobó; el método y los resultados están en la verificación de HU-04. La aprobación del MVP sigue pendiente por los requisitos transversales de calidad.
