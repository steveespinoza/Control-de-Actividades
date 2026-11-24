# Flujos de una tarea — Control de Actividades

Este documento describe, paso a paso, cómo una tarea cambia de estado y cómo se comunica el resultado del guardado. Se basa en las [historias de usuario](../04-Casos%20de%20Uso/Historias-de-Usuario.md), el [modelo de datos](../05-Datos/Modelo-de-Datos.md) y la [arquitectura general](Arquitectura-General.md).

Los recorridos describen el comportamiento previsto. Las funciones del tablero y su persistencia siguen pendientes de implementación y verificación.

## Punto de partida

Una tarea nueva se guarda en **Pendiente**, con un identificador único, un título válido y `fecha_finalizacion = null`, según [HU-02](../04-Casos%20de%20Uso/HU-02.%20Registrar%20un%20pendiente.md). Sus movimientos conservan el identificador y el título de esa misma tarea.

| Origen | Destino | Condición para guardar |
| --- | --- | --- |
| Pendiente | En curso | Hay menos de 10 tareas en curso al guardar. |
| En curso | Pendiente | La tarea sigue en curso al tramitar el cambio. La columna llena permite esta salida. |
| Pendiente o En curso | Completadas | Se guardan juntos el estado completado y el momento de finalización. |
| Completadas | Pendiente o En curso | Movimiento rechazado: el cierre es definitivo. |

## 1. Pasar de Pendiente a En curso

1. El usuario elige una tarea pendiente y solicita moverla a **En curso**.
2. La interfaz indica que el movimiento está en curso, sin confirmar todavía que se guardó.
3. El sistema comprueba el estado vigente de la tarea y la capacidad de En curso al guardar. La comprobación y el cambio deben coordinarse para mantener el límite ante operaciones simultáneas.
4. Si ya hay **10 tareas en curso**, rechaza el movimiento. La tarea permanece en Pendiente y se informa que se debe sacar una tarea de En curso antes de ingresar otra.
5. Si hay capacidad, guarda `estado = en_curso`, conservando el identificador, el título y la fecha de finalización nula.
6. Tras confirmar el guardado, la misma tarea deja de aparecer en Pendiente y aparece en En curso. La ocupación se actualiza; si antes había 9 tareas, queda en **10 de 10**.

El movimiento corresponde a [HU-03](../04-Casos%20de%20Uso/HU-03.%20Actualizar%20lo%20que%20estoy%20haciendo.md) y debe cumplir el límite de [HU-04](../04-Casos%20de%20Uso/HU-04.%20Limitar%20mi%20trabajo%20en%20curso.md).

## 2. Devolver de En curso a Pendiente

1. El usuario elige una tarea en curso y solicita devolverla a **Pendiente**.
2. La interfaz indica que el movimiento está en curso.
3. El sistema comprueba el estado vigente de la tarea. Una tarea que ya fue completada no puede volver a Pendiente.
4. Guarda `estado = pendiente`, conservando el identificador, el título y la fecha de finalización nula.
5. Tras confirmar el guardado, la tarea deja de aparecer en En curso y aparece en Pendiente. Se libera una plaza y se actualiza la ocupación de En curso.

Este recorrido sigue permitido cuando En curso está en **10 de 10**. Su comportamiento está definido en HU-03.

## 3. Completar desde Pendiente o En curso

1. El usuario elige una tarea pendiente o en curso y solicita moverla a **Completadas**.
2. La interfaz indica que el guardado está en curso.
3. El sistema consulta el estado vigente de la tarea. Si ya está completada, aplica el comportamiento de solicitudes repetidas descrito más adelante.
4. Si continúa pendiente o en curso, determina el momento de finalización con una referencia temporal explícita, según el modelo de datos.
5. Guarda `estado = completada` y `fecha_finalizacion` juntos, en una sola operación consistente. Conserva el identificador y el título.
6. Tras confirmar el guardado, la misma tarea deja de aparecer en su columna de origen y aparece en Completadas. Si procedía de En curso, libera una plaza y actualiza su ocupación, incluso si esa columna estaba llena.
7. La tarea queda cerrada definitivamente y conserva su momento de finalización. Al consultar el avance semanal, se cuenta una sola vez en la semana que le corresponde en **America/Lima**, según [HU-07](../04-Casos%20de%20Uso/HU-07.%20Revisar%20lo%20que%20termin%C3%A9%20en%20la%20semana.md).

Este recorrido está definido en [HU-05](../04-Casos%20de%20Uso/HU-05.%20Completar%20una%20tarea.md). El avance semanal se calcula desde las tareas guardadas y sus fechas de finalización.

## 4. Repetir una finalización o intentar reabrir

1. El sistema recibe una solicitud sobre una tarea que ya está completada, por ejemplo, desde una pestaña que conservaba información anterior.
2. Comprueba el estado guardado de la tarea antes de modificarla.
3. Si la solicitud intenta completarla otra vez, conserva el estado y la fecha originales. No registra otra finalización ni incrementa el conteo por ese intento.
4. Si intenta devolverla a Pendiente o En curso, rechaza el movimiento y mantiene la tarea completada. La interfaz no ofrece controles de reapertura.

Estas condiciones deben mantenerse también ante solicitudes simultáneas desde dos pestañas y ante solicitudes directas a Supabase durante el desarrollo.

## 5. Resolver un fallo de guardado

1. El usuario solicita un movimiento y la interfaz indica que está en curso.
2. El almacenamiento rechaza el cambio o el intento termina con un error.
3. El sistema comunica el fallo sin confirmar que el movimiento se guardó correctamente.
4. Ante un guardado fallido, la tarea conserva o recupera su estado anterior, con el mismo identificador y título, sin perderse ni duplicarse.
5. Si el intento era completar la tarea, no queda una finalización parcial: el estado completado y su fecha deben guardarse juntos.

Un rechazo por falta de capacidad comunica que se alcanzó el límite. Un fallo al consultar los datos se comunica como error de lectura y no se presenta como un tablero vacío.

## Recorrido del guardado por etapa

| Etapa | Cómo se tramita el movimiento |
| --- | --- |
| Desarrollo con Supabase | La interfaz envía la solicitud a las operaciones de servidor de Next.js. El servidor valida y coordina el cambio con Supabase; Postgres hace cumplir las reglas al guardar. El resultado vuelve a la interfaz para confirmar el movimiento o comunicar el error. |
| Versión final con localStorage | La interfaz tramita el movimiento mediante la lógica del navegador, que valida y coordina el acceso a localStorage. El resultado del guardado local permite confirmar el movimiento o comunicar el error. Todas las tareas utilizan ese almacenamiento, incluidas las completadas. |

El cambio de Supabase a localStorage ocurre al terminar el desarrollo. Mover o completar una tarea mantiene el almacenamiento de la etapa vigente. La recuperación de tareas al recargar y los límites de cada etapa están descritos en [HU-06](../04-Casos%20de%20Uso/HU-06.%20Continuar%20con%20mis%20tareas%20guardadas.md).

## Operaciones desde dos pestañas

Si hay **9 tareas en curso** y dos pestañas intentan ingresar tareas distintas, el guardado debe impedir que ambas operaciones dejen **11 tareas** en esa columna. Si un ingreso ocupa la última plaza, otro ingreso que encuentre la columna llena se rechaza y mantiene su tarea en Pendiente.

Si una pestaña completa una tarea, otra no puede devolverla a Pendiente o En curso usando el estado que había leído antes de esa finalización. Dos solicitudes para completar la misma tarea deben conservar una sola finalización y su fecha original.

El mecanismo concreto de coordinación depende del almacenamiento de cada etapa y queda pendiente de implementación y verificación con operaciones concurrentes controladas.

## Estado y referencias

Los flujos respetan los [requisitos funcionales](../02-Requisitos/Requisitos-Funcionales.md) y los [requisitos no funcionales](../02-Requisitos/Requisitos-No-Funcionales.md). La alternativa para cambiar el estado debe permitir el uso con teclado y, si se incorpora arrastrar y soltar, ofrecer una forma de mover sin arrastrar.

**Estado:** flujos documentados, pendientes de implementación y verificación. No se han ejecutado movimientos con datos reales, pruebas de concurrencia ni comprobaciones de rendimiento como parte de este documento.
