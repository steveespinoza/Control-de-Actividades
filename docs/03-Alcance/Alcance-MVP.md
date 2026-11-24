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

Los siguientes puntos deben comprobarse sobre la implementación; todavía no se marcan como cumplidos:

- [ ] Se puede abrir el tablero, crear tareas, moverlas dentro de las reglas y consultar el avance semanal, conforme a RF-01 a RF-06.
- [ ] El máximo de 10 tareas en curso y la prohibición de reapertura se mantienen también ante operaciones desde dos pestañas; los reintentos no duplican tareas ni finalizaciones.
- [ ] La aplicación recupera sus datos desde localStorage al recargar y volver a abrir en el mismo navegador y sitio, mientras se mantengan sus datos locales.
- [ ] El conteo semanal utiliza Lima y clasifica correctamente las finalizaciones a ambos lados del lunes a las 00:00.
- [ ] La carga del tablero, la creación, los cambios de columna y la consulta semanal cumplen el máximo de **3 segundos**, con el volumen de **200 tareas** y las condiciones de **Wi-Fi o 4G** de RNF-04.
- [ ] Se verifica el uso en computadoras y dispositivos móviles, con teclado, ratón e interacción táctil según corresponda. Se documenta la matriz de pruebas respecto al objetivo de las **tres últimas versiones estables de todos los navegadores**; las combinaciones no probadas quedan identificadas.
- [ ] Se revisan los demás criterios de calidad de RNF-01 a RNF-08 y se registran los resultados, las limitaciones y los pendientes que afecten a la entrega.
- [ ] `npm run lint`, `npm run typecheck` y `npm run build` terminan correctamente. Estas comprobaciones complementan las pruebas de uso y de datos.
- [ ] La documentación permite preparar y ejecutar el proyecto y describe localStorage como almacenamiento desde el inicio.
- [ ] La documentación indica que no hay respaldos ni restauración si se borran los datos del navegador.

## Conservación y pérdida de datos

Los datos permanecen en el mismo navegador y sitio mientras se conserven sus datos locales. Borrarlos implica perder las tareas para la aplicación. No habrá respaldos ni restauración.

Se mantienen las obligaciones de informar errores de lectura o escritura y de preservar la integridad de los cambios confirmados. La ausencia de respaldos no permite tratar un fallo de lectura como un tablero vacío ni confirmar un guardado fallido.

## Estado actual

El repositorio contiene la base técnica, la documentación, la consulta de HU-01 y el registro de HU-02. El formulario crea pendientes en localStorage y actualiza el tablero solo después del guardado. Los movimientos, su guardado y el avance semanal siguen pendientes. Las verificaciones y sus límites están en [HU-01](../04-Casos%20de%20Uso/HU-01.%20Consultar%20mi%20tablero.md#verificación-de-esta-entrega) y [HU-02](../04-Casos%20de%20Uso/HU-02.%20Registrar%20un%20pendiente.md#verificación-en-navegador-y-pendientes); la aprobación del MVP sigue pendiente.
