# Control de Actividades

Estoy preparando un tablero personal para organizar tareas en Pendiente, En curso y Completadas. La consulta de HU-01 ya muestra las tareas guardadas en localStorage, con estados de carga, vacío y error. Crear y mover tareas y consultar el avance semanal siguen pendientes, según los [requisitos funcionales](docs/02-Requisitos/Requisitos-Funcionales.md).

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

Abre [http://localhost:3000](http://localhost:3000). El tablero funciona sin credenciales ni servicios externos. En un navegador sin tareas guardadas muestra las tres columnas vacías; la creación llegará con HU-02.

## Persistencia local y conservación de datos

El tablero consulta **localStorage desde el inicio del desarrollo**. Lee un arreglo JSON de tareas en la clave `control-de-actividades:tareas`, según el [modelo de datos](docs/05-Datos/Modelo-de-Datos.md#persistencia-en-localstorage). HU-01 solo lee y valida: no crea, modifica ni elimina datos. La escritura sigue pendiente.

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

### Pruebas de lectura de HU-01

`npm test` ejecuta las 20 pruebas de [tests/leer-tareas.test.mjs](tests/leer-tareas.test.mjs) con el ejecutor de Node.js. Requiere las dependencias instaladas con `npm ci`; no necesita levantar la aplicación ni configurar credenciales.

La suite transpila los módulos reales de tareas con el TypeScript instalado a una carpeta temporal del sistema, que elimina al terminar. Llama a `leerTareas()` con un almacenamiento simulado y comprueba datos válidos, vacío, errores, duplicados, fechas, capacidad y conservación de 200 tareas. También detecta operaciones distintas de lectura. No accede a los datos reales del navegador.

Los [casos y resultados esperados](docs/04-Casos%20de%20Uso/HU-01.%20Consultar%20mi%20tablero.md#pruebas-automatizadas-de-lectura) están documentados en HU-01. En navegador se revisó el tablero vacío en escritorio y móvil; siguen pendientes los recorridos con tareas, errores y reintento, recarga y reapertura con datos, títulos largos y etiquetas mostradas como texto, navegación con teclado, la matriz de compatibilidad y el rendimiento en Wi-Fi y 4G. Las pruebas de lectura no verifican esos recorridos visuales ni miden el rendimiento de la interfaz.

## Estructura

```text
app/                    Página del tablero, layout y estilos globales.
  _components/          Consulta del tablero y sus estados de interfaz.
  lib/                  Tipo Tarea, validación y lectura de localStorage.
tests/                  Pruebas automatizadas de lectura de HU-01.
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
