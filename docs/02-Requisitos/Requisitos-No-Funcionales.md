# Requisitos no funcionales

Este documento define las condiciones de calidad para el tablero personal descrito en [Requisitos funcionales](Requisitos-Funcionales.md). Se basa en [Problema y objetivo](../00-Inicio/Problema-y-Objetivo.md) y conserva las tecnologías descritas en el [README](../../README.md).

Los criterios describen lo que deberá verificarse al implementar el sistema. No representan pruebas ejecutadas ni resultados obtenidos. Las metas que todavía necesitan datos de uso se identifican al final.

## RNF-01. Usabilidad y claridad

**Objetivo:** que el usuario pueda reconocer sus pendientes y decidir por dónde empezar sin aprender un proceso complejo.

**Criterios de verificación:**

- La interfaz debe utilizar español y mantener los nombres **Pendiente**, **En curso** y **Completadas** de forma consistente.
- Las tareas, sus estados y la ocupación de **En curso** deben poder identificarse desde el tablero.
- Los mensajes deben explicar qué ocurrió y, cuando corresponda, cómo continuar; no deben mostrar detalles internos de la aplicación.
- En una prueba de uso con sus propios pendientes, el usuario debe poder decidir qué hacer en menos de un minuto desde que el tablero esté disponible. Esta meta procede del objetivo del proyecto y todavía debe validarse.

## RNF-02. Adaptación a dispositivos y compatibilidad

**Objetivo:** que el tablero pueda utilizarse en computadoras y dispositivos móviles, en todos los navegadores web en sus tres últimas versiones estables.

**Criterios de verificación:**

- Los títulos, campos y controles deben permanecer legibles y utilizables en ambos tamaños de pantalla.
- El diseño debe permitir acceder a las tres columnas sin superponer u ocultar acciones necesarias. Si se utiliza desplazamiento para recorrer el tablero, debe permitir alcanzar todo su contenido.
- Crear y mover tareas y consultar el avance semanal debe poder realizarse tanto con ratón como mediante interacción táctil.
- Las funciones del tablero deben ser compatibles con las tres últimas versiones estables de cada navegador, tanto en computadoras como en dispositivos móviles.
- La verificación debe registrar una matriz de navegadores, versiones, sistemas operativos y tamaños de pantalla. Las tres versiones de referencia deben identificarse en la fecha de cada evaluación.
- Solo debe declararse verificada una combinación si se probaron sus recorridos principales. El objetivo de compatibilidad con todos los navegadores no equivale a cobertura de pruebas ya realizada.

## RNF-03. Accesibilidad básica

**Objetivo:** que las acciones principales no dependan exclusivamente del color, del ratón o de un gesto de arrastre.

**Criterios de verificación:**

- Los campos y botones deben tener etiquetas o nombres comprensibles.
- Las acciones principales deben poder ejecutarse con teclado y mostrar qué control tiene el foco.
- Si se implementa arrastrar y soltar, debe existir una alternativa que permita cambiar el estado sin arrastrar.
- Los estados, errores y el límite de tareas deben indicarse con texto, aunque también se utilicen colores.
- El texto y los controles deben distinguirse del fondo en la revisión visual. Estos criterios no equivalen por sí solos a una certificación de accesibilidad.

## RNF-04. Rendimiento y respuesta de la interfaz

**Objetivo:** que las operaciones principales tarden como máximo **3 segundos**, con un volumen de referencia de **200 tareas en total** y una conexión normal por **Wi-Fi o datos móviles 4G**.

**Criterios de verificación:**

- Cuando una operación esté pendiente, la interfaz debe indicarlo para distinguir la espera de un fallo o de una operación terminada.
- Una respuesta lenta no debe dejar la interfaz bloqueada de forma indefinida ni provocar que se informe un guardado exitoso antes de confirmarlo.
- La carga inicial del tablero debe completarse en un máximo de **3 segundos**, medidos desde que se abre la aplicación hasta que las tareas y los controles están disponibles para su uso.
- Crear una tarea o cambiarla de columna debe tardar como máximo **3 segundos**, desde la acción del usuario hasta la confirmación del guardado y la actualización visible. Un cambio visual anticipado no equivale a una operación guardada.
- Consultar el avance semanal debe tardar como máximo **3 segundos**, desde la solicitud hasta que se muestra el conteo correspondiente.
- La evaluación debe utilizar un conjunto de hasta **200 tareas**, sumando **Pendiente**, **En curso** y **Completadas**, y respetando el máximo de 10 tareas en curso.
- Las pruebas deben cubrir una conexión normal por Wi-Fi y otra por datos móviles 4G. Deben registrarse navegador, versión, dispositivo, entorno, cantidad y distribución de tareas y condiciones de conexión observadas, incluidas su velocidad y latencia.
- Cada operación evaluada debe cumplir el máximo de 3 segundos. Un promedio inferior a ese valor no demuestra que se haya cumplido el tiempo máximo.

Las 200 tareas constituyen el volumen de referencia de rendimiento; el límite funcional de **En curso** sigue siendo de 10 tareas.

## RNF-05. Integridad y tolerancia a fallos

**Objetivo:** conservar los cambios confirmados y evitar estados inconsistentes ante errores o acciones simultáneas.

**Criterios de verificación:**

- Todas las tareas deben guardarse en **localStorage desde el inicio del desarrollo**, independientemente de su estado.
- Las reglas de estado y capacidad de RF-03 y RF-04 deben cumplirse al guardar los datos, también ante movimientos desde dos pestañas.
- Las tareas guardadas deben recuperarse al recargar o volver a abrir la aplicación en el mismo navegador y sitio, siempre que sus datos locales se conserven. No se exige compartir el tablero entre navegadores o dispositivos.
- Si localStorage no está disponible o rechaza una escritura, debe comunicarse el fallo sin informar que el cambio se guardó.
- No se implementan respaldos ni restauración. Si se borran los datos del sitio o del navegador, la aplicación no recupera las tareas desde otra copia.
- Un fallo al cambiar de columna debe dejar la tarea en un estado válido, sin duplicarla ni perderla.
- Completar una tarea y registrar su fecha de finalización debe ser una sola operación consistente. Repetir la solicitud no debe cambiar esa fecha ni aumentar el conteo semanal.
- Un error de lectura debe comunicarse sin presentar información que no pudo cargarse como si el tablero estuviera vacío.
- Si falla la creación, el título introducido debe conservarse en el formulario mientras la página siga abierta, para que el usuario pueda corregir o repetir el intento.
- Estas condiciones deben verificarse con fallos de guardado y operaciones concurrentes controladas; una compilación correcta no las demuestra.

## RNF-06. Coherencia de fechas

**Objetivo:** que una misma tarea pertenezca a la misma semana aunque cambie la zona horaria del navegador o del servidor.

**Criterios de verificación:**

- La clasificación semanal y las fechas mostradas deben utilizar **America/Lima (Perú)**, de acuerdo con RF-06.
- El sistema debe conservar el momento de finalización de manera que su interpretación no dependa de la configuración regional del dispositivo.
- La verificación debe incluir una tarea completada inmediatamente antes del lunes a las 00:00 y otra completada exactamente en ese instante, en hora de Lima: deben pertenecer a semanas distintas.
- Cambiar la zona horaria del dispositivo no debe modificar el conteo de una semana ya consultada.

## RNF-07. Seguridad técnica y protección de datos

**Objetivo:** proteger las credenciales de los servicios y tratar de forma segura los datos introducidos en el tablero, manteniendo el acceso sin inicio de sesión definido en RF-01.

**Criterios de verificación:**

- Las claves privadas de AWS y otros secretos no deben aparecer en el código enviado al navegador, las respuestas ni los mensajes de error.
- Los datos introducidos deben validarse al guardar. Un título con etiquetas o código debe tratarse como texto, sin ejecutarlo en la interfaz.
- Si la aplicación se publica en internet, sus comunicaciones deben utilizar HTTPS.
- Las credenciales de los servicios conservados no son necesarias para la persistencia local del tablero ni deben enviarse al navegador.
- Durante el desarrollo, el autor es la única persona con acceso al sistema, sin incorporar un inicio de sesión a la aplicación. Los datos se guardan localmente en el navegador y sitio utilizados.

## RNF-08. Mantenibilidad y reproducibilidad

**Objetivo:** que el proyecto pueda prepararse, comprobarse y modificarse con las herramientas existentes.

**Criterios de verificación:**

- Deben conservarse las tecnologías y la configuración descritas en el README. Un requisito de calidad no autoriza incorporar nuevas dependencias o servicios.
- El código debe mantener TypeScript estricto y permitir ejecutar correctamente `npm run lint`, `npm run typecheck` y `npm run build`.
- La documentación debe indicar cómo preparar el entorno y qué variables necesita la implementación, utilizando ejemplos sin secretos.
- La estructura y validación de los datos de localStorage deben corresponder al modelo de datos documentado.
- Las verificaciones deben cubrir las reglas críticas: límite de 10 tareas, imposibilidad de reabrir tareas completadas, persistencia y límites semanales en Lima.
- Los resultados deben distinguir comprobaciones de código, pruebas con datos y verificaciones del entorno desplegado.

## Conservación y pérdida de datos

La aplicación utiliza localStorage en el mismo navegador y sitio desde el inicio del desarrollo. No implementa respaldos ni restauración: borrar los datos locales implica perder las tareas para la aplicación, sin recuperación desde otra copia.

La recarga y la reapertura deben recuperar los datos mientras estos se conserven. Los errores de lectura, guardado y operaciones simultáneas mantienen los criterios de integridad anteriores. Esta decisión no establece un porcentaje de disponibilidad del sitio ni incorpora un modo sin conexión completo.
