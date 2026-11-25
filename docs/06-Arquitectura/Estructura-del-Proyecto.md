# Estructura del proyecto — Control de Actividades

Esta es la organización prevista para implementar el tablero con localStorage desde el inicio dentro de la aplicación Next.js existente. Distribuye las responsabilidades de [Arquitectura general](Arquitectura-General.md) y los [flujos de una tarea](Flujos.md), conservando el código fuente en `app/`, en la raíz del proyecto.

La tabla siguiente identifica el código existente. El árbol posterior incluye también ubicaciones futuras que se incorporarán al desarrollar las historias correspondientes.

## Código que existe actualmente

| Ruta | Contenido actual |
| --- | --- |
| `app/page.tsx` | Estructura del tablero y navegación; entrada de la aplicación en `/`. |
| `app/layout.tsx` | Layout principal, idioma español y metadatos. |
| `app/globals.css` | Estilos globales y entrada de Tailwind CSS 4. |
| `app/_components/tablero.tsx` | Consulta de HU-01: columnas, títulos, ocupación de En curso y estados de carga, vacío y error. |
| `app/_components/formulario-tarea.tsx` | Registro de HU-02, validación de título, espera, error y conservación del valor ante fallos. |
| `app/lib/tareas.ts` | Tipo Tarea, validación de atributos y máximo de tareas en curso. |
| `app/lib/client/tareas.ts` | Lectura, registro y movimientos entre Pendiente y En curso, con bloqueo compartido de Web Locks. |
| `tests/leer-tareas.test.mjs` | Veinte pruebas de la función real de lectura con almacenamiento simulado, ejecutadas mediante `npm test`. |
| `tests/registrar-tarea.test.mjs` | Dieciocho pruebas de la función real de registro con almacenamiento y bloqueos simulados, incluidas en `npm test`. |
| `tests/mover-tarea.test.mjs` | Veintiuna pruebas de movimiento, capacidad, cierre de completadas, fallos y operaciones encoladas. |
| `tests/soporte/modulos-tareas.mjs` | Transpilación temporal de los módulos reales de tareas para las tres suites de Node.js. |
| `tests/soporte/almacenamiento-tareas.mjs` | Almacenamiento y administrador de bloqueos simulados, compartidos por registro y movimiento. |
| `docs/` | Requisitos, historias, modelo de datos y diseño de arquitectura. |

Las dependencias y los comandos existentes están en `package.json`. Se mantienen TypeScript estricto y el alias `@/*` hacia la raíz de `tsconfig.json`.

## Estructura prevista del tablero

El árbol incluye los archivos actuales de la aplicación y las ubicaciones propuestas para el código futuro. Los archivos nuevos se crearán cuando una historia los necesite.

```text
app/
├── layout.tsx
├── page.tsx
├── globals.css
├── loading.tsx
├── _components/
│   ├── tablero.tsx                  Columnas, tareas y acciones de cambio de estado.
│   ├── formulario-tarea.tsx         Registro de pendientes y mensajes del formulario.
│   └── avance-semanal.tsx           Intervalo semanal y conteo de completadas.
└── lib/
    ├── tareas.ts                    Tipo Tarea, estados y validaciones compartidas.
    ├── semanas.ts                   Intervalos y conteo semanal en America/Lima.
    └── client/
        └── tareas.ts                Lectura, validación y guardado en localStorage.

tests/                               Pruebas de lectura, registro y movimiento; otras pruebas se añadirán con sus historias.
docs/                                Documentación del proyecto.
package.json                         Dependencias y comandos.
package-lock.json                    Versiones resueltas.
tsconfig.json                        Configuración de TypeScript.
eslint.config.mjs                    Configuración de lint.
postcss.config.mjs                   Configuración de Tailwind mediante PostCSS.
```

El esquema lógico de Tarea está en el [modelo de datos](../05-Datos/Modelo-de-Datos.md). La persistencia del tablero se realiza en el navegador.

## Responsabilidad de cada ubicación

| Ubicación | Responsabilidad prevista |
| --- | --- |
| `app/page.tsx` | Entregar la estructura de la página y los componentes de cliente que consultan y modifican las tareas locales. |
| `app/loading.tsx` | Mostrar la espera durante la carga de la ruta. Los componentes de cliente gestionarán además la espera de sus lecturas y operaciones del navegador. |
| `app/_components/` | Presentar tablero, formulario y avance semanal con sus estados de carga, vacío y error. Los puntos de entrada de interacción utilizarán `use client`. La carpeta privada agrupa componentes sin crear rutas. |
| `app/lib/tareas.ts` | Reunir el tipo Tarea, los valores de estado y las validaciones compartidas. |
| `app/lib/semanas.ts` | Calcular los límites semanales y clasificar las finalizaciones usando America/Lima. |
| `app/lib/client/tareas.ts` | Leer, validar y guardar la colección de tareas en localStorage. Coordinar cambios entre pestañas y comunicar fallos de lectura o escritura. |
| `tests/` | Pruebas de lectura, registro y movimientos de HU-01 a HU-03 mediante `npm test` y el ejecutor de Node.js, con almacenamiento y bloqueos simulados. |

Los componentes pueden contener sus columnas y tarjetas mientras resulte sencillo mantenerlos juntos. Los archivos se dividirán cuando haya una responsabilidad concreta o reutilización que lo justifique.

## Separación entre navegador y servidor

Los módulos compartidos de tareas y semanas contendrán tipos y lógica sin acceder por sí mismos a credenciales ni al almacenamiento.

El código de `app/lib/client/` se ejecutará desde componentes de cliente cuando el navegador esté disponible. La lectura de localStorage no formará parte del renderizado de servidor. Next.js entrega la aplicación y sus recursos; las operaciones de las tareas se realizan en el navegador.

El registro y los movimientos adquieren el mismo bloqueo exclusivo de Web Locks, `control-de-actividades:tareas`, y leen los datos vigentes antes de escribir. HU-03 comprueba el límite de diez y rechaza la reapertura de completadas. La futura finalización deberá compartir ese bloqueo y guardar juntos estado y fecha.

## Configuración de servicios

`.env.example` conserva variables de servicios externos como referencia; el almacenamiento local del tablero no las necesita. Los valores privados del entorno siguen excluidos de Git.

## Conservación y archivos generados

No se implementarán respaldos ni restauración. Si se borran los datos del sitio o del navegador, las tareas se pierden para la aplicación, según [HU-06](../04-Casos%20de%20Uso/HU-06.%20Continuar%20con%20mis%20tareas%20guardadas.md).

`node_modules/`, `.next/`, `next-env.d.ts` y `*.tsbuildinfo` corresponden a dependencias o resultados generados. El código fuente se mantiene en `app/`; los resultados de compilación no son la ubicación para desarrollar funciones.

**Estado:** consulta de HU-01, registro de HU-02 y movimientos de HU-03 implementados, con sus pruebas. La finalización y el avance semanal siguen pendientes.
