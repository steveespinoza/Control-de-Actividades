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
| Persistencia | Conservar títulos, estados y fechas de finalización al recargar o volver a abrir la aplicación, según la etapa de almacenamiento descrita más adelante. | RF-05 |
| Avance semanal | Consultar cuántas tareas se completaron en la semana correspondiente, mostrando el intervalo de fechas y **0** cuando no hubo finalizaciones. | RF-06 |

Los errores de carga o guardado deben comunicarse sin presentar una operación fallida como exitosa ni perder o duplicar tareas por un movimiento.

## Reglas que delimitan la versión

- Hay un solo actor: el [Usuario](../01-Usuarios/Rol%20-%20Usuario.md) que organiza sus pendientes personales. No hay gestión de equipos ni asignación de tareas a otras personas.
- Cada tarea pertenece a una sola columna. Las tareas completadas conservan su fecha de finalización y no vuelven a **Pendiente** ni a **En curso**.
- El límite de 10 se aplica únicamente a **En curso**. Alcanzarlo no impide crear tareas pendientes ni sacar tareas de esa columna.
- Cada tarea cuenta una sola vez en la semana en que se completó. La semana comienza el **lunes a las 00:00 en America/Lima (Perú)** y termina al comenzar el lunes siguiente, sin incluir ese instante.
- Las **200 tareas totales** son el volumen de referencia para evaluar rendimiento, sumando las tres columnas. No se ha definido un bloqueo de creación al llegar a esa cantidad.

## Almacenamiento por etapas

| Etapa | Almacenamiento previsto | Condición de cierre |
| --- | --- | --- |
| Desarrollo | Base de datos de **Supabase** para guardar y verificar las tareas y sus cambios. Solo el autor tiene acceso al sistema. | Comprobar la persistencia y las reglas del tablero en esa etapa, sin incorporar un inicio de sesión. |
| Entrega final del MVP | **localStorage** para todas las tareas, independientemente de su estado. | Comprobar que se recuperan títulos, estados y fechas en el mismo navegador y sitio y que se cumplen las reglas funcionales y de calidad aplicables. |

El paso a localStorage se realiza al terminar el desarrollo; no se activa por completar una tarea. La entrega final no utiliza Supabase para persistir o sincronizar el tablero.

Los datos finales quedan asociados al navegador y sitio utilizados. Su conservación depende de que esos datos locales se mantengan. No se incluye sincronización entre navegadores o dispositivos.

Las tareas existentes en Supabase no se conservarán ni se trasladarán al pasar a localStorage. La versión final comienza sin tareas procedentes de la fase de desarrollo; no se implementará una migración de esos datos.

Se mantienen las tecnologías descritas en el [README](../../README.md). Conservar Supabase o S3 en la configuración no incorpora funciones adicionales al producto.

## Fuera del alcance de esta entrega

Las funciones y condiciones excluidas se detallan en [Fuera de alcance](Fuera-de-Alcance.md). Esas exclusiones no son un plan de funciones futuras. Cualquier ampliación requiere una nueva definición de alcance.

## Criterios para considerar terminada la entrega

Los siguientes puntos deben comprobarse sobre la implementación; todavía no se marcan como cumplidos:

- [ ] Se puede abrir el tablero, crear tareas, moverlas dentro de las reglas y consultar el avance semanal, conforme a RF-01 a RF-06.
- [ ] El máximo de 10 tareas en curso y la prohibición de reapertura se mantienen también ante operaciones desde dos pestañas; los reintentos no duplican tareas ni finalizaciones.
- [ ] La versión final recupera sus datos desde localStorage al recargar y volver a abrir la aplicación en el mismo navegador y sitio.
- [ ] El conteo semanal utiliza Lima y clasifica correctamente las finalizaciones a ambos lados del lunes a las 00:00.
- [ ] La carga del tablero, la creación, los cambios de columna y la consulta semanal cumplen el máximo de **3 segundos**, con el volumen de **200 tareas** y las condiciones de **Wi-Fi o 4G** de RNF-04.
- [ ] Se verifica el uso en computadoras y dispositivos móviles, con teclado, ratón e interacción táctil según corresponda. Se documenta la matriz de pruebas respecto al objetivo de las **tres últimas versiones estables de todos los navegadores**; las combinaciones no probadas quedan identificadas.
- [ ] Se revisan los demás criterios de calidad de RNF-01 a RNF-08 y se registran los resultados, las limitaciones y los pendientes que afecten a la entrega.
- [ ] `npm run lint`, `npm run typecheck` y `npm run build` terminan correctamente. Estas comprobaciones complementan las pruebas de uso y de datos.
- [ ] La documentación permite preparar y ejecutar el proyecto y diferencia la fase con Supabase de la persistencia final en localStorage.
- [ ] La transición a localStorage respeta la decisión de no conservar ni trasladar las tareas de Supabase.
- [ ] Al implementar localStorage, se definen y documentan las condiciones de disponibilidad y recuperación correspondientes a esa etapa.

## Disponibilidad y recuperación: definición por etapa

La disponibilidad y la recuperación se abordarán al comenzar la implementación de **localStorage**. En esa etapa se definirán el entorno de uso, la tolerancia a interrupciones y las necesidades de respaldo y restauración. No se fija todavía una política ni una garantía de recuperación ante el borrado de datos locales.

Esta definición queda diferida y no bloquea el desarrollo con Supabase. El acceso exclusivo del autor durante el desarrollo y la decisión de no trasladar sus tareas ya están definidos.

## Estado actual

El repositorio contiene la base técnica, una página inicial y la documentación de requisitos. Las funciones del tablero, la persistencia y el avance semanal están pendientes de implementación. La aprobación del alcance y la verificación del MVP no se dan por realizadas al completar este documento.
