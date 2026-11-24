# Modelo de datos — Control de Actividades

Este documento define el modelo lógico mínimo para las [historias de usuario](../04-Casos%20de%20Uso/Historias-de-Usuario.md), a partir de los [requisitos funcionales](../02-Requisitos/Requisitos-Funcionales.md). Describe el diseño previsto; todavía no existe un esquema implementado ni migraciones funcionales que lo materialicen.

## Entidad Tarea

Una **Tarea** representa un pendiente personal que puede pasar por los estados del tablero hasta completarse. Su identificador permite conservar la misma tarea al cambiarla de columna y reconocerla al repetir una operación.

| Atributo | Tipo lógico | Obligatorio | Descripción y reglas |
| --- | --- | --- | --- |
| `id` | UUID | Sí | Clave primaria. Identifica de forma única a la tarea y se conserva durante su existencia. |
| `titulo` | Texto | Sí | Nombre visible de la tarea. Debe contener al menos un carácter distinto de espacios y tratarse como texto al mostrarlo. El alcance vigente no contempla editarlo después de crear la tarea. |
| `estado` | Valor enumerado | Sí | Solo admite `pendiente`, `en_curso` o `completada`. Las tareas nuevas se crean con `pendiente`. |
| `fecha_finalizacion` | Instante con referencia temporal explícita | Solo al completar | Es nula en tareas pendientes o en curso. Al completar, guarda el momento de finalización y permanece inmutable. Se representa en UTC y se interpreta en America/Lima para las fechas y el conteo semanal. |

Los nombres de los atributos y sus tipos son parte de este diseño. Su implementación física en Supabase y su representación en localStorage quedan pendientes.

## Diagrama del modelo

![Modelo lógico: entidad Tarea con id como clave primaria, titulo, estado y fecha_finalizacion.](diagramas/Modelo-de-Datos.svg)

### Explicación del diagrama

El rectángulo representa la única entidad persistida del modelo: **Tarea**. Cada fila identifica uno de sus atributos. La marca **PK** señala la clave primaria y la columna de nulabilidad indica si el atributo puede carecer de valor.

El modelo tiene una sola entidad, por lo que no hay relaciones ni claves foráneas. El **Usuario** es el actor del sistema, sin una cuenta almacenada. Las columnas del tablero corresponden al atributo `estado`; el tablero se obtiene agrupando las tareas. La ocupación de En curso y el avance semanal son resultados calculados a partir de esas tareas.

## Estados y transiciones

| Valor de `estado` | Etiqueta en el tablero | Destinos permitidos | `fecha_finalizacion` |
| --- | --- | --- | --- |
| `pendiente` | Pendiente | En curso, si hay capacidad, o Completadas. | Nula. |
| `en_curso` | En curso | Pendiente o Completadas. | Nula. |
| `completada` | Completadas | Permanece completada; no puede reabrirse. | Obligatoria e inmutable. |

La creación y los movimientos están definidos en RF-02 y RF-03. Una tarea pertenece a una sola columna según su estado guardado.

## Reglas de integridad

- Cada tarea tiene un identificador único. Moverla conserva ese identificador y su título, sin generar otra tarea.
- Una tarea tiene fecha de finalización si y solo si está completada. El nuevo estado y la fecha se guardan juntos, como una sola operación consistente.
- Repetir la finalización de una tarea ya completada conserva su fecha original y no registra otra finalización.
- El conjunto de tareas con `estado = en_curso` admite un máximo de **10**. La regla se comprueba al guardar y debe mantenerse ante operaciones desde dos pestañas y, durante el desarrollo, ante solicitudes directas a Supabase.
- Alcanzar el máximo permite seguir creando tareas pendientes y sacar tareas de En curso. Las **200 tareas totales** son el volumen de evaluación de rendimiento, sin constituir un límite de creación.
- Una escritura fallida se comunica como error y no se confirma como guardada. Los movimientos fallidos no deben perder ni duplicar tareas.

Las restricciones de cada tarea y el límite sobre el conjunto deberán materializarse en el almacenamiento de cada etapa. El mecanismo de coordinación de operaciones concurrentes queda pendiente de implementación y verificación; el diagrama por sí solo no garantiza estas reglas.

## Datos calculados

| Dato | Cálculo |
| --- | --- |
| Tareas de cada columna | Agrupar por `estado`. |
| Ocupación de En curso | Contar las tareas con `estado = en_curso` y mostrar el resultado junto al máximo de 10. |
| Avance semanal | Contar cada tarea completada una sola vez, utilizando `fecha_finalizacion` dentro del intervalo de la semana consultada. Si la consulta termina correctamente sin finalizaciones en ese periodo, el resultado es 0. |

La semana comienza el **lunes a las 00:00 en America/Lima (Perú)**, incluyendo ese instante, y termina al comenzar el lunes siguiente, sin incluir ese límite final. El intervalo mostrado y el conteo usan esa zona, independientemente de la configuración del dispositivo o del servidor, según [RF-06](../02-Requisitos/Requisitos-Funcionales.md#rf-06-consultar-el-avance-semanal).

Estos resultados se calculan desde las tareas guardadas; no requieren una entidad Semana ni un contador de finalizaciones persistido.

## Almacenamiento por etapas

| Etapa | Representación prevista de Tarea | Condiciones |
| --- | --- | --- |
| Desarrollo con Supabase | Registro con identificador UUID, título de texto, estado restringido a los tres valores permitidos y fecha de finalización de tipo temporal con zona (`timestamptz`), nula hasta completar. | Los cambios del esquema deberán quedar en migraciones. Solo el autor tiene acceso al sistema, sin incorporar un inicio de sesión a la aplicación. |
| Versión final con localStorage | Objeto dentro de una colección de tareas: identificador y título como cadenas, estado con los mismos valores y fecha como cadena ISO 8601 en UTC o `null`. | Se guardan todas las tareas, incluidas las completadas. Se recuperan en el mismo navegador y sitio mientras se conserven los datos locales. |

El cambio a localStorage se realiza al terminar el desarrollo y abarca todas las tareas. Las tareas existentes en Supabase no se conservan ni se trasladan a la versión final. Completar una tarea no cambia su almacenamiento.

La disponibilidad y la recuperación ante pérdida de datos se definirán al comenzar la implementación de localStorage, conforme a los [requisitos no funcionales](../02-Requisitos/Requisitos-No-Funcionales.md). Esta definición no bloquea la etapa de desarrollo con Supabase.

## Límites y estado

El modelo respeta el [alcance del MVP](../03-Alcance/Alcance-MVP.md) y sus [exclusiones](../03-Alcance/Fuera-de-Alcance.md). El acceso personal sin cuentas y la ausencia de adjuntos, subtareas y colaboración mantienen el modelo centrado en Tarea.

**Estado:** modelo documentado, pendiente de implementación y verificación. No se han creado tablas, aplicado migraciones ni ejecutado pruebas de datos como parte de este documento.
