# Estructura del proyecto — Control de Actividades

Esta es la organización prevista para implementar el tablero dentro de la aplicación Next.js existente. Distribuye las responsabilidades de [Arquitectura general](Arquitectura-General.md) y los [flujos de una tarea](Flujos.md), conservando el código fuente en `app/`, en la raíz del proyecto.

Las rutas propuestas describen código futuro. Se incorporarán al desarrollar las historias correspondientes; este documento no crea componentes, operaciones de servidor, migraciones ni pruebas.

## Código que existe actualmente

| Ruta | Contenido actual |
| --- | --- |
| `app/page.tsx` | Página inicial de preparación. Es la entrada de la aplicación en `/`. |
| `app/layout.tsx` | Layout principal, idioma español y metadatos. |
| `app/globals.css` | Estilos globales y entrada de Tailwind CSS 4. |
| `supabase/config.toml` | Configuración local de Supabase conservada. |
| `docs/` | Requisitos, historias de usuario, modelo de datos y diseño de arquitectura. |

Las dependencias y los comandos existentes están definidos en `package.json`. La configuración de TypeScript estricto y el alias `@/*` hacia la raíz se mantienen en `tsconfig.json`.

## Estructura prevista

El árbol incluye los archivos actuales que se conservarán y las ubicaciones propuestas para el código futuro. Las carpetas y los archivos nuevos se crearán cuando una historia los necesite.

```text
app/
├── layout.tsx
├── page.tsx
├── globals.css
├── loading.tsx
├── actions.ts                       Operaciones de servidor durante el desarrollo.
├── _components/
│   ├── tablero.tsx                  Columnas, tareas y acciones de cambio de estado.
│   ├── formulario-tarea.tsx         Registro de pendientes y mensajes del formulario.
│   └── avance-semanal.tsx           Intervalo semanal y conteo de completadas.
└── lib/
    ├── tareas.ts                    Tipo Tarea, estados y validaciones compartidas.
    ├── semanas.ts                   Intervalos y conteo semanal en America/Lima.
    ├── server/
    │   └── tareas.ts                Acceso a Supabase durante el desarrollo.
    └── client/
        └── tareas.ts                Acceso a localStorage en la versión final.

supabase/
├── config.toml
└── migrations/
    └── <fecha>_crear_tareas.sql      Nombre ilustrativo de una migración futura.

tests/                               Pruebas de reglas, fechas y persistencia.
docs/                                Documentación del proyecto.
.env.example                         Nombres de variables y ejemplos sin secretos.
package.json                         Dependencias y comandos.
package-lock.json                    Versiones resueltas de dependencias.
tsconfig.json                        Configuración de TypeScript.
eslint.config.mjs                    Configuración de lint.
postcss.config.mjs                   Configuración de Tailwind mediante PostCSS.
```

El esquema y los atributos de Tarea se describen en el [modelo de datos](../05-Datos/Modelo-de-Datos.md). El nombre de la migración es una referencia de organización, sin un archivo SQL creado o aplicado.

## Responsabilidad de cada ubicación

| Ubicación | Responsabilidad prevista |
| --- | --- |
| `app/page.tsx` | Componer la entrada al tablero. Durante el desarrollo podrá consultar los datos desde el servidor; en la versión final entregará la estructura de la página y los componentes de cliente que trabajan con localStorage. |
| `app/loading.tsx` | Mostrar la espera durante la carga de la ruta. Los componentes interactivos también gestionarán las esperas de sus operaciones y las lecturas del navegador. |
| `app/_components/` | Presentar el tablero, el formulario y el avance semanal, con sus estados de carga, vacío y error. Los componentes que sean puntos de entrada de interacción utilizarán `use client`. La carpeta privada `_components` agrupa la interfaz sin crear rutas. |
| `app/lib/tareas.ts` | Reunir el tipo Tarea, los valores de estado y las validaciones que se comparten entre interfaz y operaciones. La validación compartida complementa las reglas que se hacen cumplir al guardar. |
| `app/lib/semanas.ts` | Calcular los límites semanales y clasificar las finalizaciones usando America/Lima, con independencia de la zona horaria del entorno. |
| `app/actions.ts` | Agrupar las acciones de servidor de Next.js durante la etapa con Supabase. Validar las solicitudes, coordinar las escrituras y devolver resultados que permitan comunicar éxito o error. Estas acciones utilizarán `use server`. |
| `app/lib/server/tareas.ts` | Ejecutar las consultas y escrituras necesarias en Supabase desde el servidor. Mantener el acceso a datos y las credenciales de servidor fuera del código del navegador. |
| `app/lib/client/tareas.ts` | Leer, validar y guardar la colección de tareas en localStorage durante la etapa final. Coordinar los cambios entre pestañas y comunicar fallos de lectura o escritura. |
| `supabase/migrations/` | Reproducir el esquema, las restricciones, los permisos y las operaciones de Postgres necesarias para las historias de la etapa de desarrollo. |
| `tests/` | Incorporar pruebas de las reglas críticas, los límites semanales, la persistencia, los errores y las operaciones concurrentes, con las herramientas que se concreten durante la implementación. Actualmente no hay un comando de pruebas automatizadas definido. |

Los componentes del tablero pueden contener sus columnas y tarjetas mientras resulte sencillo mantenerlos juntos. Los archivos se dividirán cuando haya una responsabilidad concreta o reutilización que lo justifique.

## Separación entre navegador y servidor

Los módulos compartidos de tareas y semanas contendrán tipos y lógica que puedan utilizarse en ambos entornos, sin acceder a credenciales ni al almacenamiento por sí mismos.

El código de `app/lib/server/` se utilizará desde el servidor. Los componentes de cliente accederán a las operaciones de servidor mediante las acciones de Next.js, manteniendo los módulos de Supabase y los secretos en su entorno correspondiente.

El código de `app/lib/client/` se ejecutará desde componentes de cliente cuando el navegador esté disponible. La persistencia final en localStorage se realizará allí; la lectura de ese almacenamiento no formará parte del renderizado de servidor.

Las reglas que deban resistir solicitudes directas a Supabase se materializarán en Postgres. La coordinación de cambios en localStorage deberá preservar las mismas condiciones de integridad en la etapa final. Los mecanismos concretos y sus pruebas siguen pendientes de implementación.

## Uso de la estructura por etapas

Durante el desarrollo, el recorrido previsto utiliza `app/actions.ts`, `app/lib/server/tareas.ts` y las migraciones de Supabase. Al pasar a la versión final, las operaciones de las tareas se ejecutarán en el navegador con `app/lib/client/tareas.ts`; el recorrido final no consultará Supabase para guardar o sincronizar el tablero.

El cambio de etapa sustituye el almacenamiento de todas las tareas, incluidas las completadas. Las tareas de Supabase no se conservarán ni se trasladarán a localStorage, según [HU-06](../04-Casos%20de%20Uso/HU-06.%20Continuar%20con%20mis%20tareas%20guardadas.md).

## Archivos de configuración y generados

Las variables previstas se documentan en `.env.example`. Los valores privados del entorno se mantienen en archivos locales excluidos de Git. La preparación y los comandos disponibles se describen en el [README](../../README.md).

`node_modules/`, `.next/`, `next-env.d.ts` y los archivos `*.tsbuildinfo` corresponden a dependencias o resultados generados. El código fuente se mantiene en `app/`; los resultados de compilación no se usan como ubicación para desarrollar funciones.

**Estado:** estructura futura documentada, pendiente de materializar con la implementación de las historias. Esta entrega solo modifica documentación y conserva la organización actual del código.
