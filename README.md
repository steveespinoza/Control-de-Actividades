# Control de Actividades

El desarrollo funcional del MVP está cerrado. El tablero permite organizar tareas en Pendiente, En curso y Completadas, registrar pendientes, moverlos y completarlos en localStorage. La vista de avance semanal muestra cuántas tareas se terminaron en cada semana, según los [requisitos funcionales](docs/02-Requisitos/Requisitos-Funcionales.md).

El [cierre funcional del 25 de noviembre de 2026](docs/03-Alcance/Alcance-MVP.md#cierre-funcional) registra la implementación y las comprobaciones realizadas. La aceptación integral de calidad mantiene pendientes las mediciones de rendimiento con Wi-Fi y 4G, la matriz completa de navegadores y dispositivos y las verificaciones manuales indicadas en la documentación.

## Tecnologías

- Next.js 16 y React 19.
- TypeScript estricto y Tailwind CSS 4.
- ESLint.
- localStorage para todas las tareas desde el inicio del desarrollo, sin inicio de sesión ni sincronización entre dispositivos.
- Amazon S3 privado para archivos y Vercel como destino previsto de despliegue.

Las dependencias y sus versiones se conservan en `package.json` y `package-lock.json`. La configuración de S3 se mantiene, sin integrarse en la persistencia del tablero.

## Desarrollo local

Necesitas Node.js 20.9 o superior y npm. Desde la carpeta del repositorio:

```bash
npm ci
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). El tablero funciona sin credenciales ni servicios externos. Pulsa **Nueva tarea**, escribe un título y selecciona **Guardar tarea**. La tarea aparece en Pendiente después de guardarse. Los títulos vacíos o compuestos solo por espacios se rechazan; si el guardado falla, el título permanece en el formulario.

En las tarjetas activas puedes usar **Pasar a En curso**, **Volver a Pendiente** o **Completar tarea**, según su estado. El cambio se muestra después de guardarse. En curso admite diez tareas; si está lleno, devuelve una a Pendiente o complétala antes de ingresar otra. Completar guarda también su fecha UTC y es un cierre definitivo: la tarjeta muestra **Tarea cerrada**, sin controles de reapertura. Repetir la finalización conserva la fecha original.

Abre **Avance semanal** desde el menú para consultar su vista propia en `/avance-semanal`. Muestra el intervalo y el total de completadas, con controles para consultar la semana anterior, la actual y la siguiente. Las semanas comienzan el lunes a las 00:00 en America/Lima y excluyen el comienzo del lunes siguiente. Una consulta válida sin cierres muestra **0**; una lectura fallida muestra un error y permite reintentar. La vista lee los datos guardados al abrirse y al consultar una semana.

La interfaz utiliza el gris `#d6dfe2` en el fondo del tablero y la barra lateral, con paneles blancos, acentos negros y separadores de 2 px. En móvil, una cabecera negra permite abrir la navegación y un selector muestra una columna de tareas cada vez. El diseño, las tipografías y la cobertura de las revisiones están en [Pantallas](docs/07-Interfaz/Pantallas.md#presentación-actual).

## Persistencia local y conservación de datos

El tablero utiliza **localStorage desde el inicio del desarrollo**. La clave `control-de-actividades:tareas` contiene un arreglo JSON de tareas, según el [modelo de datos](docs/05-Datos/Modelo-de-Datos.md#persistencia-en-localstorage). La consulta solo lee y valida. El registro añade una tarea en Pendiente con UUID y fecha de finalización nula, conservando las anteriores.

El registro, los movimientos y la finalización comparten un bloqueo de Web Locks para coordinar lectura y escritura entre pestañas. Al completar, estado y fecha se guardan en una única escritura. El registro requiere además `crypto.randomUUID()`, en un contexto seguro como HTTPS o localhost. Si no hay Web Locks, se informa el problema sin guardar. Las otras pestañas muestran los cambios al recargar o solicitar una operación; no hay actualización visual en tiempo real.

La espera para obtener el bloqueo se cancela a los **2,5 segundos**. Se informa que el cambio no se guardó y se habilita el reintento; el formulario conserva el título. La solicitud cancelada no escribe después de liberar el bloqueo. Este límite evita una espera indefinida y no acredita por sí solo el objetivo de rendimiento de RNF-04.

**No habrá respaldos ni restauración.** Si se borran los datos del sitio o del navegador, las tareas se pierden para la aplicación. La recarga y la reapertura conservarán lo guardado mientras esos datos locales se mantengan. No hay sincronización entre navegadores o dispositivos.

Los errores al leer o guardar deben comunicarse. La ausencia de respaldos no elimina las reglas de integridad, el máximo de 10 tareas en curso ni el cierre definitivo de las completadas.

## Configuración conservada de servicios

El tablero no necesita variables de S3 para su almacenamiento local. `.env.example` conserva los nombres de las variables de ese servicio como referencia. Las credenciales privadas permanecen en archivos de entorno excluidos de Git.

## Comprobaciones

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

`lint` revisa el código, `typecheck` comprueba los tipos y `build` genera la compilación de producción. Para ejecutar esa compilación:

```bash
npm run start
```

### Pruebas de tareas

`npm test` ejecuta 96 pruebas con el ejecutor de Node.js: 20 de [lectura](tests/leer-tareas.test.mjs), 18 de [registro](tests/registrar-tarea.test.mjs), 21 de [movimiento](tests/mover-tarea.test.mjs), 20 de [finalización](tests/completar-tarea.test.mjs), 6 de [espera del bloqueo](tests/espera-bloqueo.test.mjs) y 11 de [avance semanal](tests/avance-semanal.test.mjs). Requiere las dependencias instaladas con `npm ci`; no necesita levantar la aplicación ni configurar credenciales.

Las suites comparten [un cargador de los módulos reales](tests/soporte/modulos-tareas.mjs): TypeScript los transpila a una carpeta temporal del sistema, que elimina al terminar. La suite de lectura comprueba integridad y ausencia de escrituras. La de registro comprueba validación, creación, conservación de datos, fallos, reintentos y espera del bloqueo. El almacenamiento y el administrador de bloqueos están simulados; no se accede a los datos reales del navegador.

La suite de movimiento comprueba capacidad, cierre de completadas, fallos, reintentos y operaciones encoladas. Registro, movimiento y finalización comparten [el entorno simulado](tests/soporte/almacenamiento-tareas.mjs). La [verificación de HU-04](docs/04-Casos%20de%20Uso/HU-04.%20Limitar%20mi%20trabajo%20en%20curso.md#verificación-de-contención-real) incluye dos solicitudes realmente solapadas desde nueve en curso: una ocupa la última plaza y la otra se rechaza, sin perder ni duplicar tareas.

La suite de finalización controla el reloj para comprobar estado y fecha en una escritura, cierre repetido sin cambiar la fecha, liberación de capacidad, fallos y coordinación con registro y movimientos. La [verificación de HU-05](docs/04-Casos%20de%20Uso/HU-05.%20Completar%20una%20tarea.md#verificación-en-navegador-y-pendientes) incluye el cierre en escritorio y móvil, teclado y foco, recarga, dos cierres solapados de la misma tarea y vencimiento de la espera en la interfaz. Los fallos controlados de lectura y escritura y los envíos repetidos desde la interfaz están documentados en [HU-06](docs/04-Casos%20de%20Uso/HU-06.%20Continuar%20con%20mis%20tareas%20guardadas.md#verificación-de-fallos-y-envíos-repetidos).

Las pruebas de espera comprueban cancelación, ausencia de escrituras tardías y reintentos en las tres operaciones. Las de avance semanal cubren los dos límites del lunes, cambios de mes y año, año bisiesto, otras zonas del dispositivo, recarga y finalización repetida. Los recorridos y límites de navegador están en [HU-07](docs/04-Casos%20de%20Uso/HU-07.%20Revisar%20lo%20que%20termin%C3%A9%20en%20la%20semana.md#verificación-y-pendientes).

Los casos y resultados esperados están en [HU-01](docs/04-Casos%20de%20Uso/HU-01.%20Consultar%20mi%20tablero.md#pruebas-automatizadas-de-lectura) y [HU-02](docs/04-Casos%20de%20Uso/HU-02.%20Registrar%20un%20pendiente.md#pruebas-automatizadas-de-registro). En navegador se comprobó el registro en escritorio y móvil, la validación, la cancelación, el foco, la recarga, los títulos largos y el reintento con título conservado después de agotar la espera. La revisión posterior de HU-06 comprobó acceso denegado, lectura y escritura rechazadas, conservación del título y doble clic y Enter repetidos, con una sola escritura por operación confirmada. Los fallos se inyectaron en un origen local de prueba. Quedan pendientes tecnologías de asistencia, la matriz completa de navegadores y el rendimiento con Wi-Fi y 4G.

La [revisión de teclado y compatibilidad](docs/07-Interfaz/Pantallas.md#revisión-de-teclado-y-compatibilidad) registra los recorridos del navegador integrado y Chrome nativo, la cobertura parcial de Edge y las combinaciones pendientes. Incluye la corrección del foco al reintentar el avance semanal y regiones de estado persistentes. La validación hablada con lector de pantalla y la matriz completa siguen pendientes.

La [revisión actual de contraste y accesibilidad](docs/07-Interfaz/Pantallas.md#contraste-y-accesibilidad-actual) documenta colores, relaciones y recorridos de las dos vistas, con un mínimo de texto normal de 4,55:1 en las combinaciones medidas. Corregí el borde y el foco del campo, la salida del menú con Tab, el foco tras recuperar la carga y el recorte del contorno de las tarjetas. Los cambios de color de los botones y las esperas conservan el contraste sin atenuar el texto. La revisión se limita al entorno registrado y mantiene identificadas las comprobaciones manuales pendientes.

## Estructura

```text
app/                    Página del tablero, layout y estilos globales.
  _components/          Navegación, tablero, formulario de registro y avance semanal.
  lib/                  Tareas locales, validación, bloqueos y cálculo semanal en Lima.
tests/                  Pruebas de tareas, cancelación de espera y avance semanal.
docs/
  00-Inicio/            Problema y objetivo del sistema.
  01-Usuarios/          Actor y perfil del usuario.
  02-Requisitos/        Requisitos funcionales y no funcionales.
  03-Alcance/           Funciones incluidas y límites de la primera entrega.
  04-Casos de Uso/      Historias de usuario y criterios de aceptación.
  05-Datos/             Modelo lógico de datos y diagrama de la entidad Tarea.
  06-Arquitectura/      Arquitectura, estructura prevista y flujos de las tareas.
  07-Interfaz/          Prototipos, diseño actual y verificaciones de escritorio y móvil.
```

## Documentación

- [Problema y objetivo](docs/00-Inicio/Problema-y-Objetivo.md).
- [Actores](docs/01-Usuarios/Actores.md).
- [Requisitos funcionales](docs/02-Requisitos/Requisitos-Funcionales.md).
- [Requisitos no funcionales](docs/02-Requisitos/Requisitos-No-Funcionales.md).
- [Alcance del MVP](docs/03-Alcance/Alcance-MVP.md).
- [Fuera de alcance](docs/03-Alcance/Fuera-de-Alcance.md).
- [Historias de usuario](docs/04-Casos%20de%20Uso/Historias-de-Usuario.md).
- [Modelo de datos](docs/05-Datos/Modelo-de-Datos.md).
- [Arquitectura general](docs/06-Arquitectura/Arquitectura-General.md).
- [Estructura del proyecto](docs/06-Arquitectura/Estructura-del-Proyecto.md).
- [Flujos de una tarea](docs/06-Arquitectura/Flujos.md).
- [Pantallas y prototipos](docs/07-Interfaz/Pantallas.md).
