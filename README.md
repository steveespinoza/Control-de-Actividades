# Control de Actividades

Estoy preparando un tablero personal para organizar tareas en Pendiente, En curso y Completadas. HU-01 permite consultar las tareas guardadas, HU-02 registrar pendientes y HU-03 moverlos entre Pendiente y En curso en localStorage. Completar tareas y consultar el avance semanal siguen pendientes, según los [requisitos funcionales](docs/02-Requisitos/Requisitos-Funcionales.md).

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

En cada tarjeta puedes usar **Pasar a En curso** o **Volver a Pendiente**. El cambio se muestra después de guardarse. En curso admite diez tareas; si está lleno, devuelve una a Pendiente antes de ingresar otra. Las tareas completadas no pueden moverse.

## Persistencia local y conservación de datos

El tablero utiliza **localStorage desde el inicio del desarrollo**. La clave `control-de-actividades:tareas` contiene un arreglo JSON de tareas, según el [modelo de datos](docs/05-Datos/Modelo-de-Datos.md#persistencia-en-localstorage). La consulta solo lee y valida. El registro añade una tarea en Pendiente con UUID y fecha de finalización nula, conservando las anteriores.

El registro y los movimientos comparten un bloqueo de Web Locks para coordinar lectura y escritura entre pestañas. El registro requiere además `crypto.randomUUID()`, en un contexto seguro como HTTPS o localhost. Si no hay Web Locks, se informa el problema sin guardar. Las otras pestañas muestran los cambios al recargar, registrar o solicitar un movimiento; no hay actualización visual en tiempo real.

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

`npm test` ejecuta 59 pruebas con el ejecutor de Node.js: 20 de [lectura](tests/leer-tareas.test.mjs), 18 de [registro](tests/registrar-tarea.test.mjs) y 21 de [movimiento](tests/mover-tarea.test.mjs). Requiere las dependencias instaladas con `npm ci`; no necesita levantar la aplicación ni configurar credenciales.

Las suites comparten [un cargador de los módulos reales](tests/soporte/modulos-tareas.mjs): TypeScript los transpila a una carpeta temporal del sistema, que elimina al terminar. La suite de lectura comprueba integridad y ausencia de escrituras. La de registro comprueba validación, creación, conservación de datos, fallos, reintentos y espera del bloqueo. El almacenamiento y el administrador de bloqueos están simulados; no se accede a los datos reales del navegador.

La suite de movimiento comprueba capacidad, cierre de completadas, fallos, reintentos y operaciones encoladas. Registro y movimiento comparten [el entorno simulado](tests/soporte/almacenamiento-tareas.mjs). Los casos y la revisión en producción están documentados en [HU-03](docs/04-Casos%20de%20Uso/HU-03.%20Actualizar%20lo%20que%20estoy%20haciendo.md#verificación-en-navegador-y-pendientes); incluyen el rechazo del undécimo ingreso y el uso de una pestaña con datos desactualizados. La contención simultánea real sigue pendiente de verificar.

Los casos y resultados esperados están en [HU-01](docs/04-Casos%20de%20Uso/HU-01.%20Consultar%20mi%20tablero.md#pruebas-automatizadas-de-lectura) y [HU-02](docs/04-Casos%20de%20Uso/HU-02.%20Registrar%20un%20pendiente.md#pruebas-automatizadas-de-registro). En navegador se comprobó el registro en escritorio y móvil, la validación, la cancelación, el foco, la recarga, los títulos largos y dos pestañas abiertas. Quedan pendientes los fallos forzados de almacenamiento en la interfaz, la espera prolongada y los envíos rápidos duplicados, la evaluación con tecnologías de asistencia, la matriz completa de navegadores y el rendimiento con Wi-Fi y 4G.

## Estructura

```text
app/                    Página del tablero, layout y estilos globales.
  _components/          Tablero y formulario de registro.
  lib/                  Tipo Tarea, validación, lectura, registro y movimientos locales.
tests/                  Pruebas automatizadas de lectura, registro y movimientos.
docs/
  00-Inicio/            Problema y objetivo del sistema.
  01-Usuarios/          Actor y perfil del usuario.
  02-Requisitos/        Requisitos funcionales y no funcionales.
  03-Alcance/           Funciones incluidas y límites de la primera entrega.
  04-Casos de Uso/      Historias de usuario y criterios de aceptación.
  05-Datos/             Modelo lógico de datos y diagrama de la entidad Tarea.
  06-Arquitectura/      Arquitectura, estructura prevista y flujos de las tareas.
  07-Interfaz/          Prototipos de las vistas de escritorio y móvil.
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
