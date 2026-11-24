# Arquitectura general — Control de Actividades

La aplicación se organiza en tres capas lógicas: **presentación**, **aplicación y reglas**, y **persistencia**. Conserva una sola base de código con Next.js 16, React 19, TypeScript estricto y Tailwind CSS 4.

Este documento describe la arquitectura prevista para las [historias de usuario](../04-Casos%20de%20Uso/Historias-de-Usuario.md) y el [modelo de datos](../05-Datos/Modelo-de-Datos.md). Actualmente existe la página inicial; las funciones del tablero y la persistencia siguen pendientes de implementación y verificación.

## Diagrama general

![Arquitectura prevista por etapas: durante el desarrollo, la interfaz del navegador se comunica con Next.js en el servidor y este con Supabase; en la versión final, Next.js entrega la aplicación y el navegador ejecuta la interfaz, las reglas y el acceso a localStorage.](diagramas/Arquitectura-General.svg)

### Explicación del diagrama

Durante el **desarrollo**, el usuario utiliza la interfaz en el navegador. Los componentes de servidor y las operaciones de servidor de Next.js coordinan las consultas y los cambios con Supabase. Las reglas de integridad también se aplican al guardar en Postgres, incluidas las solicitudes directas a los datos. Las credenciales administrativas permanecen en el servidor.

En la **versión final**, Next.js entrega la aplicación al navegador. Los componentes de cliente ejecutan las interacciones y el acceso a localStorage. La lógica de las tareas y su persistencia se realizan en ese navegador; el servidor no puede acceder a su localStorage. Todas las tareas, incluidas las completadas, se guardan en el mismo sitio y navegador utilizados.

Las flechas representan la dirección de las solicitudes y del acceso a datos. Los resultados regresan a la interfaz para mostrar las tareas o comunicar el resultado de una operación. Los dos recorridos corresponden a etapas distintas del proyecto: al terminar el desarrollo se sustituye la persistencia con Supabase por localStorage, sin conservar ni trasladar las tareas de desarrollo. Completar una tarea mantiene el almacenamiento de la etapa vigente.

## Capas y responsabilidades

| Capa | Responsabilidad | Durante el desarrollo | En la versión final |
| --- | --- | --- | --- |
| Presentación | Mostrar las tres columnas, títulos, ocupación de En curso y avance semanal. Recibir las acciones del usuario y distinguir carga, vacío, éxito y error. Mantener controles accesibles en computadoras y móviles. | React 19 y Tailwind CSS 4, con Next.js App Router para componer las páginas y componentes. | La misma responsabilidad de interfaz, con componentes de cliente para la interacción y las lecturas del almacenamiento local. |
| Aplicación y reglas | Validar títulos, coordinar creación y movimientos, respetar el máximo de 10 tareas en curso, mantener el cierre definitivo y calcular el avance semanal en America/Lima. | TypeScript y operaciones de servidor de Next.js para validar y coordinar el acceso a Supabase. Postgres hace cumplir las invariantes al guardar. | TypeScript ejecutado en el navegador para validar y coordinar las operaciones con localStorage, manteniendo las reglas ante el uso de dos pestañas. |
| Persistencia | Guardar y recuperar la entidad Tarea con su identificador, título, estado y momento de finalización. Comunicar fallos y conservar la consistencia de los cambios confirmados. | Supabase con Postgres. El esquema, las restricciones y los permisos deberán reproducirse mediante migraciones. | localStorage con la representación definida en el modelo de datos. Los datos permanecen asociados al sitio y al navegador, sin sincronización entre dispositivos. |

Las capas describen responsabilidades dentro de la aplicación. La organización prevista en archivos se detalla en [Estructura del proyecto](Estructura-del-Proyecto.md) y se materializará al implementar cada historia, aprovechando las herramientas existentes.

## Reglas en los límites de la arquitectura

- **Guardado consistente:** completar una tarea y registrar su fecha debe ser una sola operación. Repetir la finalización conserva la fecha original y no aumenta el conteo semanal.
- **Operaciones simultáneas:** el máximo de 10 tareas en curso y el cierre definitivo deben mantenerse ante solicitudes desde dos pestañas. Durante el desarrollo, también se comprueban ante solicitudes directas a Supabase. El mecanismo concreto de coordinación para cada almacenamiento queda pendiente de implementación y pruebas.
- **Fechas:** el momento de finalización conserva una referencia temporal explícita, según el modelo de datos. La clasificación semanal y las fechas mostradas utilizan America/Lima, con el inicio del lunes incluido y el comienzo del lunes siguiente excluido.
- **Acceso y credenciales:** el usuario abre el tablero sin inicio de sesión. Durante el desarrollo, solo el autor tiene acceso al sistema; la configuración del entorno que haga efectiva esa condición está pendiente. Las claves administrativas de Supabase y las claves privadas de AWS no se envían al navegador ni se muestran en errores.
- **Errores de datos:** una lectura fallida se comunica como error. Una escritura fallida no se confirma como guardada y un movimiento no debe perder ni duplicar tareas.

Estas condiciones proceden de los [requisitos funcionales](../02-Requisitos/Requisitos-Funcionales.md) y los [requisitos no funcionales](../02-Requisitos/Requisitos-No-Funcionales.md). Su descripción no acredita que los controles estén implementados.

## Tecnologías previstas y límites

**Vercel** es el destino previsto de despliegue de la aplicación Next.js. El despliegue y su configuración no están verificados. Cuando la aplicación se publique en internet, sus comunicaciones deberán utilizar HTTPS, conforme a RNF-07.

La configuración de **Amazon S3 privado** se conserva. El alcance vigente excluye archivos adjuntos, por lo que S3 no participa en el recorrido de las tareas representado en el diagrama.

La versión final conserva sus datos en localStorage y no utiliza Supabase para persistir o sincronizar el tablero. La disponibilidad y la recuperación ante pérdida de datos se definirán al comenzar esa etapa; esta definición queda diferida y no bloquea el desarrollo con Supabase.

## Estado actual

| Elemento | Estado comprobado en el repositorio |
| --- | --- |
| Base de Next.js | Página inicial, layout en español, estilos y comandos de desarrollo, lint, tipos y compilación definidos. |
| Funciones del tablero | Pendientes de implementación. |
| Supabase | Configuración local conservada; sin integración de datos en la aplicación, esquema funcional ni vinculación local a un proyecto remoto. |
| Modelo de datos | Documentado; pendiente de materializar en el almacenamiento. |
| localStorage | Pendiente de implementación en la etapa final. |
| Integraciones y despliegue | S3 sin integración funcional y Vercel como destino previsto, sin verificación de despliegue en esta entrega. |

La revisión de este documento cubre su coherencia con el código y el alcance actual. No se han implementado capas funcionales, ejecutado pruebas de integración ni realizado despliegues como parte de esta documentación.

## Referencias

- [Flujos de una tarea, paso a paso](Flujos.md).
- [Modelo de datos](../05-Datos/Modelo-de-Datos.md).
- [Historias de usuario y diagrama de casos de uso](../04-Casos%20de%20Uso/Historias-de-Usuario.md).
- [Alcance del MVP](../03-Alcance/Alcance-MVP.md).
- [Fuera de alcance](../03-Alcance/Fuera-de-Alcance.md).
- [Preparación y comandos del proyecto](../../README.md).
