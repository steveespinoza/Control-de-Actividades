# Pantallas — Control de Actividades

Estas dos vistas presentan una propuesta inicial de distribución del tablero en escritorio y móvil. **Son prototipos de baja fidelidad:** sirven para revisar la organización de la información y las acciones principales.

Las imágenes conservan la propuesta inicial y no son capturas de la interfaz actual. El diseño implementado y sus verificaciones se describen más abajo; el comportamiento sigue los [requisitos funcionales](../02-Requisitos/Requisitos-Funcionales.md).

## Vista de escritorio

![Prototipo de escritorio: barra lateral, acción Nueva Actividad y tres columnas con tarjetas ilustrativas.](../../Vista%20Desktop.jpeg)

La propuesta utiliza una barra lateral con la identificación del proyecto y el acceso al tablero. En la zona principal sitúa la acción de creación en la parte superior y distribuye los tres estados en columnas paralelas, con las tareas representadas como tarjetas.

Las tarjetas con el texto «Actividad» son contenido ilustrativo del prototipo. En la aplicación deberán mostrar el título de cada tarea guardada.

## Vista móvil

![Prototipo móvil: acción Nueva Actividad, selector de estados y tarjetas de la columna Pendiente en una distribución vertical.](../../Vista%20Movil.jpeg)

La propuesta sitúa la acción de creación arriba, seguida de un selector de estados. La captura muestra la vista de **Pendiente**, con las tarjetas organizadas verticalmente. El selector ya está implementado; la interacción en dispositivos táctiles reales sigue pendiente de verificación.

## Relación entre el prototipo y la implementación

- **Presentación visual:** lienzo y barra lateral en gris claro luminoso, paneles blancos, acentos negros, radios de 4 px y franjas laterales por estado.
- **Textos:** la aplicación utiliza **Nueva tarea**, **Pendiente**, **En curso** y **Completadas**. Las imágenes conservan los rótulos iniciales «Nueva Actividad», «En proceso» y «Completado».
- **Acciones:** registro desde el formulario, arrastre de tarjetas en escritorio y control **Mover a** en móvil. Pasar a **Completadas** cierra la tarea definitivamente.
- **Información del tablero:** ocupación y máximo de 10 tareas en curso y consulta del avance semanal, conforme a las [historias de usuario](../04-Casos%20de%20Uso/Historias-de-Usuario.md).
- **Estados de la interfaz:** carga, tablero vacío, guardado en curso, errores y validación del título.
- **Accesibilidad:** nombres de controles, enlace para saltar al contenido, foco visible y regiones de estado. La cobertura y los pendientes se detallan en las revisiones, sin declarar una auditoría completa.

Las imágenes se mantienen como referencia del prototipo, sin convertir los elementos ilustrativos en funciones adicionales.

## Estado

**Interfaz implementada con verificaciones de calidad pendientes.** El diseño actual utiliza gris claro luminoso en el lienzo y la barra lateral, paneles blancos y negro como color principal. Desde 768 px y con un puntero preciso, el tablero muestra tres columnas y se puede arrastrar una tarjeta activa entre ellas. Durante el arrastre, la tarjeta conserva su tamaño, colores y contenido. Con el teclado, se puede enfocar con Tab y pulsar **1**, **2** o **3** para moverla. En la vista móvil se consulta una columna a la vez. Las tarjetas activas muestran **Mover a** debajo del título, alineado con el borde izquierdo del icono y con dos destinos según su estado actual.

La revisión visual inicial se describe en [HU-01](../04-Casos%20de%20Uso/HU-01.%20Consultar%20mi%20tablero.md#verificación-de-esta-entrega), y la del formulario y tareas registradas en [HU-02](../04-Casos%20de%20Uso/HU-02.%20Registrar%20un%20pendiente.md#verificación-en-navegador-y-pendientes). Las capturas del prototipo no acreditan pruebas de funcionamiento ni la compatibilidad completa. El comportamiento esperado se conserva en los requisitos y en los [flujos de una tarea](../06-Arquitectura/Flujos.md).

Las verificaciones históricas de movimientos, teclado y límite de capacidad mediante botones están en [HU-03](../04-Casos%20de%20Uso/HU-03.%20Actualizar%20lo%20que%20estoy%20haciendo.md#verificación-en-navegador-y-pendientes).

## Presentación actual

La cabecera del contenido reúne **Mi tablero**, **Datos en este navegador**, la ocupación de En curso y **Nueva tarea**. Las pistas grises contienen tarjetas blancas con franja gris en Pendiente, negra en En curso y esmeralda en Completadas. El estado se distingue en el título de la tarjeta con un reloj rojo para **Pendiente**, un icono de reproducción amarillo para **En curso** y un check verde para **Completadas**. El texto del título usa el color de su icono. Las tarjetas completadas quedan cerradas.

| Elemento | Presentación implementada |
| --- | --- |
| Navegación | Barra lateral gris fija de 256 px desde 1024 px, con enlaces a Tablero (`/`) y Avance semanal (`/avance-semanal`) y señal de la página activa. Por debajo, cabecera negra fija de 56 px y menú lateral desplegable de 288 px con el mismo gris sobre un fondo atenuado. |
| Columnas | Tres columnas desde 768 px si hay un puntero preciso, con listas desplazables mediante teclado. En la vista móvil, selector de Pendiente, En curso y Completadas con sus contadores. Registrar muestra Pendiente. Al mover o completar se conserva la columna abierta y se actualizan los contadores. |
| Tipografía | Plus Jakarta Sans para el texto y Geist Mono para los números. Se configuran en `app/layout.tsx` mediante `next/font/google`, que obtiene y aloja los archivos con la aplicación; el navegador no necesita solicitarlos a Google Fonts. |
| Superficies y controles | Fondo del tablero y barra lateral en gris `#d6dfe2`, definido en `--background`; paneles y tarjetas blancos, color principal `#111111`, radios de 4 px y sombras suaves. Los separadores del sidebar, formulario, tarjetas y pie de página, y los contornos de paneles, columnas y tarjetas tienen 2 px. Botones principales negros y secundarios blancos con borde. |
| Foco y movimiento | Contorno negro de 2 px sobre superficies claras, incluido el campo, y blanco en la cabecera negra. Los cambios de color de los botones y el contenido durante una espera no se atenúan. La entrada conserva solo el desplazamiento; los movimientos se reducen con `prefers-reduced-motion`. |
| Avance semanal | Vista propia en `/avance-semanal`, con panel blanco, título principal, cifra negra, intervalo en Lima y controles que se ajustan en varias líneas. Lee localStorage al abrirse y al consultar una semana. El tablero muestra únicamente las tareas y sus acciones. |

Los colores y estilos comunes se concentran en `app/globals.css`; `app/_components/app-shell.tsx` contiene la navegación. El menú móvil cerrado queda oculto visualmente y fuera del recorrido de Tab y del árbol accesible. Al abrirlo, el foco pasa a **Cerrar menú**. Escape, el botón de cierre y el fondo atenuado lo cierran y devuelven el foco al botón de apertura. Tab también lo cierra al salir de sus enlaces, conservando el control de destino visible. El fondo atenuado se activa con el ratón; el cierre y Escape ofrecen la alternativa de teclado. Los enlaces cierran el menú y navegan a la vista elegida. En escritorio no se enfoca el botón móvil oculto.

El ajuste anterior de fondo a `#e9ecef` se revisó en producción local a 1280 × 800 y 390 × 844, incluido el menú móvil abierto. Después se cambió el fondo a `#d6dfe2`, se aumentaron los bordes separadores a 2 px y se trasladó el avance semanal a su propia página. Las verificaciones anteriores del panel integrado y de sus enlaces por fragmento se conservan como evidencia histórica; no describen la navegación actual. Ninguna de estas revisiones visuales acredita nuevas mediciones de contraste.

### Verificación del cambio de estado

En la compilación de producción local arrastré una tarjeta a **En curso** y comprobé que soltarla fuera de las columnas cancela el movimiento. También probé las teclas **1**, **2** y **3** para devolverla a **Pendiente**, moverla a **En curso** y completarla.

En la vista de 390 px comprobé los dos destinos de **Mover a** en cada estado activo, el rechazo de la undécima tarea en curso y la persistencia tras recargar. Al mover o completar se conservó la columna abierta. El foco quedó en el control de la tarjeta vecina o en el botón de la columna al quedar vacía. Al abrir **Completadas** pude consultar la tarea cerrada.

Comprobé los iconos y los colores en los títulos, así como la alineación de **Mover a** con el icono a 320 y 390 px. La interacción táctil en un dispositivo real sigue pendiente.

## Contraste y accesibilidad actual

El **25 de noviembre de 2026** revisé la compilación de producción de las vistas `/` y `/avance-semanal` en el navegador integrado de Windows. Utilicé el origen aislado `http://localhost:3241`, con datos preparados y fallos controlados desde una página temporal ajena al repositorio. Se comprobaron **1280 × 800**, **390 × 844** y **320 × 800**. Los datos y servicios habituales de la aplicación no participaron en la prueba.

### Criterio y método de medición

Tomé como referencia [Contraste mínimo de WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum) y [Contraste no textual](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast). El mínimo del texto normal es **4,5:1**; para texto grande es **3:1**. En la tabla de texto usé 4,5:1 también para los pares compartidos con títulos, un criterio más exigente. Los bordes necesarios para reconocer el campo y las señales de foco se compararon con **3:1**. Los controles inactivos y los elementos puramente decorativos están exceptuados de estos mínimos.

Leí los colores aplicados con `getComputedStyle`, convertí los formatos CSS a sRGB y compuse las transparencias y la opacidad de los antecesores con sus fondos. Calculé la luminancia relativa y la relación `(L_mayor + 0,05) / (L_menor + 0,05)`. Los hexadecimales de colores efectivos están redondeados a canales de 8 bits para presentarlos; por eso pueden producir pequeñas diferencias al volver a calcularlos. La tabla muestra la relación con dos decimales, sin usar ese redondeo para decidir el umbral.

Las combinaciones repetidas se agrupan por sus colores. Además de los estados normales, se revisaron validación, lectura y escritura rechazadas, recuperación, guardado con bloqueo retenido, botones deshabilitados y recuperación de controles, selección móvil y botones bajo el cursor. Las mediciones finales de texto normal tuvieron un mínimo de **4,5484:1**, en el placeholder sobre `#f8fafc`. El fondo principal se conserva en `#d6dfe2`.

### Resultados de texto

Todas las combinaciones de esta tabla superan 4,5:1. Los pares invertidos se conservan cuando representan controles diferentes.

| Uso observado | Texto | Fondo efectivo | Relación |
| --- | --- | --- | --- |
| Enlace para saltar al contenido | `#ffffff` | `#111111` | 18,88:1 |
| Marca y título de sección sobre el lienzo | `#0a0a0a` | `#d6dfe2` | 14,62:1 |
| Texto auxiliar y navegación sobre el lienzo | `#475569` | `#d6dfe2` | 5,60:1 |
| Rótulos cortos sobre el lienzo | `#111111` | `#d6dfe2` | 13,95:1 |
| Navegación activa | `#0a0a0a` | `#f5f5f5` | 18,15:1 |
| Rótulo de almacenamiento local | `#0a0a0a` | `#f8fafc` | 18,92:1 |
| Aviso de almacenamiento local | `#475569` | `#f8fafc` | 7,24:1 |
| Rótulos cortos sobre paneles | `#111111` | `#ffffff` | 18,88:1 |
| Títulos, cifras y tareas | `#0a0a0a` | `#ffffff` | 19,79:1 |
| Ayudas y mensajes de espera sobre blanco | `#475569` | `#ffffff` | 7,58:1 |
| Datos en este navegador y acciones secundarias | `#171717` | `#ffffff` | 17,91:1 |
| Acciones principales, cabecera móvil y estado En curso | `#ffffff` | `#0a0a0a` | 19,79:1 |
| Encabezado Pendiente | `#334155` | `#e9eef2` | 8,89:1 |
| Contador Pendiente | `#1e293b` | `#e2e8f0` | 11,87:1 |
| Insignia Pendiente | `#334155` | `#f1f5f9` | 9,45:1 |
| Encabezado En curso | `#0a0a0a` | `#e9eef2` | 16,99:1 |
| Encabezado Completadas | `#065f46` | `#e9eef2` | 6,59:1 |
| Contador Completadas | `#065f46` | `#d1fae5` | 6,78:1 |
| Insignia Completadas y confirmación de movimiento | `#065f46` | `#ecfdf5` | 7,29:1 |
| Tarea cerrada sobre blanco | `#065f46` | `#ffffff` | 7,68:1 |
| Marca CA en el recuadro móvil | `#ffffff` | `#232323` | 15,81:1 |
| Encabezado del error de carga | `#9f0712` | `#fef2f2` | 7,66:1 |
| Errores de formulario, lectura y movimiento | `#b91c1c` | `#fef2f2` | 5,91:1 |
| Etiqueta del campo y Cancelar | `#334155` | `#ffffff` | 10,35:1 |
| Texto del campo sin foco | `#111111` | `#f8fafc` | 18,05:1 |
| Placeholder sin foco | `#64748b` | `#f8fafc` | 4,55:1 |
| Placeholder con foco | `#64748b` | `#ffffff` | 4,76:1 |
| Selector móvil inactivo | `#475569` | `#dee5ec` | 5,98:1 |
| Contadores del selector móvil | `#334155` | `#e2e8f0` | 8,40:1 |
| Botón semanal secundario bajo el cursor | `#171717` | `#f5f5f5` | 16,42:1 |
| Intervalo semanal y Cancelar bajo el cursor | `#334155` | `#f8fafc` | 9,90:1 |
| Acción principal bajo el cursor | `#ffffff` | `#000000` | 21,00:1 |
| Columna vacía con fondo translúcido | `#475569` | `#f8fafb` | 7,24:1 |

### Campo y señales de foco

Estas relaciones se calcularon con los colores finales de los estilos, incluyendo las superficies adyacentes más desfavorables que se indican. La presencia, grosor y posición de los contornos se comprobaron en el navegador.

| Elemento | Señal | Superficie adyacente | Relación | Mínimo |
| --- | --- | --- | --- | --- |
| Borde normal del campo | `#64748b` | `#f8fafc` / `#ffffff` | 4,55 / 4,76:1 | 3:1 |
| Borde inválido del campo | `#dc2626` | `#f8fafc` / `#ffffff` | 4,62 / 4,83:1 | 3:1 |
| Contorno de foco en panel o campo | `#111111` | `#ffffff` | 18,88:1 | 3:1 |
| Contorno de foco sobre el lienzo | `#111111` | `#d6dfe2` | 13,95:1 | 3:1 |
| Contorno de foco de listas y tarjetas | `#111111` | `#e9eef2` | 16,16:1 | 3:1 |
| Contorno de foco en cabecera móvil | `#ffffff` | `#0a0a0a` | 19,80:1 | 3:1 |

Los bordes claros de tarjetas, divisores e insignias son estructurales o decorativos. Los botones secundarios se identifican por su texto de alto contraste; no se calificó su borde claro como si fuera la única señal del control. Los iconos de cierre y estado acompañan texto, sin comunicar la información exclusivamente por color.

Para reproducir una relación a partir de los valores sRGB, se puede ejecutar este cálculo con Node.js, sin dependencias adicionales:

```js
const luminancia = (rgb) => rgb
  .map((valor) => valor / 255)
  .map((valor) => valor <= 0.04045
    ? valor / 12.92
    : ((valor + 0.055) / 1.055) ** 2.4)
  .reduce((total, valor, i) => total + valor * [0.2126, 0.7152, 0.0722][i], 0);
const contraste = (texto, fondo) => {
  const a = luminancia(texto);
  const b = luminancia(fondo);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};
console.log(contraste([100, 116, 139], [248, 250, 252]));
// 4.548363604249587: placeholder y borde del campo sin foco.
```

### Problemas corregidos y comprobación

| Problema observado | Corrección | Resultado comprobado |
| --- | --- | --- |
| Borde del campo `#cbd5e1` sobre blanco: 1,48:1. El foco solo dejaba una sombra tenue y `outline: none`. | Borde `#64748b` y contorno negro de 2 px con separación de 2 px. | Campo reconocible y foco sólido; el borde alcanza al menos 4,55:1. |
| Al usar Tab desde el último enlace del menú móvil, Nueva tarea recibía foco detrás del menú abierto. | Cierre al salir del sidebar con el foco; el fondo atenuado queda fuera de Tab. | Nueva tarea queda visible y el menú muestra `aria-expanded="false"`; Escape y el cierre con ratón siguen funcionando. |
| Recuperar una lectura fallida del tablero quitaba el botón de reintento y dejaba el foco en `body`. | Al recuperarse, enfoca Nueva tarea. | Reintento con fallo controlado y recuperación correcta, con foco en la acción disponible. |
| El contorno de una tarjeta completada sobresalía 4 px, pero la lista solo reservaba 2 px y podía recortarlo. | Espacio interior de lista de 4 px. | Contorno completo dentro de la zona desplazable, también con 200 tareas. |
| Al recuperar botones deshabilitados, texto y fondo interpolaban grises con relaciones observadas de 1,11:1 y 1,21:1. | Los colores de los botones cambian de inmediato. Se eliminó la atenuación por opacidad del contenido inicial y de `aria-busy`. | Registro y recuperación de controles sin pares inferiores al mínimo. Durante el guardado: opacidad 1, mensaje de estado, campo de solo lectura y botones deshabilitados. |

### Recorridos de accesibilidad

| Área | Comprobación y resultado |
| --- | --- |
| Estructura | Ambas vistas con idioma español, un `main`, un h1, nombres de controles y navegación actual identificada. No se detectaron IDs duplicados, referencias ARIA rotas ni índices de tabulación positivos en las vistas revisadas. |
| Teclado y formulario | Apertura con foco en el campo, validación de vacío, `required`, `aria-invalid` y descripciones asociadas; guardar con Enter y cancelar con espacio. Un fallo de escritura conservó el título y enfocó el campo; el reintento guardó y devolvió el foco a Nueva tarea. |
| Mensajes | Alertas de validación y de almacenamiento y regiones de estado persistentes con `aria-atomic`. El guardado se distinguió del éxito y del error. Se verificaron DOM y árbol accesible; no se escuchó un lector de pantalla. |
| Tareas | Movimiento con Enter, error de escritura con foco conservado, reintento y finalización con foco en la tarjeta cerrada. Estados y límite expresados mediante texto. |
| Menú móvil | Cerrado fuera de la tabulación y del árbol accesible; apertura, Escape, salida con Tab, cierre por botón y por clic en el fondo. El foco no quedó cubierto por el menú al continuar hacia el tablero. |
| Avance semanal | Navegación entre vistas y semanas con teclado, lectura rechazada sin un cero falso y reintento. Tanto el segundo error como la recuperación enfocaron el título; el siguiente Tab alcanzó Semana anterior. |
| Listas largas | Colección inicial de 200 tareas: 20 pendientes, 9 en curso y 171 completadas. End llevó la lista de completadas hasta su máximo de 24 194 px y permitió ver la tarea 200. Se completó otra pendiente y se comprobó el contorno de foco completo de la nueva tarjeta cerrada. En móvil se accedió a las 172 completadas mediante el selector. Esto verifica acceso al contenido, no rendimiento. |
| Reflujo y objetivos | A 320 y 390 px no se observó desbordamiento horizontal, incluidos el título largo y su cadena sin espacios, el formulario y las semanas. Los botones semanales medidos tuvieron 44 px de alto. El campo enfocado quedó por debajo de la cabecera fija de 56 px. |
| Movimiento | Se conserva la reducción de animaciones mediante `prefers-reduced-motion`; la comprobación de esta regla fue de código. No se cambió la preferencia del sistema. |

Pasaron **96 pruebas**, lint y compilación, incluida su comprobación de TypeScript. Los cambios de foco y contraste se verificaron en la interfaz compilada; las pruebas automatizadas de datos no cubren por sí solas estos recorridos.

### Límites de esta revisión

La revisión básica de contraste, teclado, foco y semántica quedó comprobada en el entorno indicado. **No constituye una certificación WCAG completa.** La salida hablada con Narrador, NVDA o VoiceOver sigue pendiente: las herramientas de esta revisión permiten inspeccionar DOM y árbol accesible, pero no comprobar su audio. Tampoco se verificaron alto contraste del sistema, zoom real de navegador, dispositivos táctiles reales ni las combinaciones restantes de la matriz. Los atajos de zoom del navegador integrado no cambiaron su escala, por lo que no se presentan como una prueba de zoom; las anchuras de 320 y 390 px acreditan reflujo en esas ventanas.

Las revisiones que siguen son anteriores a estas correcciones y se conservan como historial. Sus pendientes de contraste se sustituyen por los resultados anteriores; la compatibilidad completa y el rendimiento con Wi-Fi y 4G continúan abiertos.

### Verificación de vistas separadas y bordes — 25 de noviembre de 2026

Revisé la compilación de producción en el navegador integrado, sobre el origen de prueba `http://localhost:3231`, a **1280 × 800** y **390 × 844**. El tablero no incluyó el panel semanal. El menú abrió `/avance-semanal`, marcó la opción activa y permitió regresar al tablero; el menú móvil se cerró tras navegar. El enlace para saltar al contenido de la vista semanal permitió continuar con Tab hacia **Semana anterior**.

El avance mostró inicialmente una tarea completada. Tras registrar y completar otra tarea de prueba en el tablero, volví a la vista semanal y mostró **2**; la recarga directa de `/avance-semanal` conservó el resultado. Consulté semanas anteriores y siguientes con resultado válido de cero y regresé a la actual con teclado. Cada vista mantuvo un título principal.

Los estilos calculados confirmaron `#d6dfe2` en el fondo y 2 px en el borde lateral, paneles, columnas, tarjetas y separador del panel semanal. No observé desbordamiento horizontal, errores ni advertencias de consola durante los recorridos. Pasaron las 96 pruebas de datos, lint, comprobación de tipos y compilación. La cobertura anterior de errores y reintentos se conserva en HU-07; no se volvió a inyectar un fallo de almacenamiento en este traslado. Siguen pendientes las mediciones de contraste y las demás combinaciones y condiciones de calidad descritas al final del documento.

### Verificación del menú y del rediseño — 25 de noviembre de 2026

Revisé la compilación de producción en el navegador integrado de Windows, con datos de prueba del origen local `http://localhost:3231`, a **390 × 844** y **1280 × 800**:

- Con el menú móvil cerrado, Tab pasó del botón de apertura a **Nueva tarea**. Los enlaces laterales no aparecieron en el árbol accesible.
- Abrir con Enter enfocó **Cerrar menú**. Escape, el botón de cierre y un clic en el fondo atenuado devolvieron el foco al botón de apertura, con `aria-expanded="false"`. El foco del botón sobre la cabecera negra mostró contorno blanco.
- **Tablero** cerró el menú y conservó el foco en la apertura. **Avance semanal** cerró el menú y enfocó el panel; el siguiente Tab llegó a **Semana anterior**.
- Al pasar de móvil a escritorio sin recargar, la barra lateral volvió a estar visible y sus enlaces fueron accesibles por Tab. Al volver a móvil, el menú cerrado quedó de nuevo fuera de la tabulación.
- No observé desbordamiento horizontal en esos tamaños ni errores o advertencias de consola durante el recorrido. La revisión previa del rediseño comprobó registro, movimiento y cierre a 390 px: el selector mostró la columna de destino y el foco pasó a la acción o tarjeta correspondiente.

Pasaron las 96 pruebas de datos, lint, comprobación de tipos y compilación. Estas pruebas automatizadas no cubren el menú; su comprobación fue mediante la interfaz compilada. Las mediciones de contraste de la paleta anterior no se trasladan a la actual. Siguen pendientes la auditoría de contraste del rediseño, la salida hablada con lector de pantalla, dispositivos táctiles reales, la matriz completa de navegadores y el rendimiento con Wi-Fi y 4G.

## Verificaciones anteriores al rediseño

Los resultados de esta sección y de la revisión del 24 de noviembre corresponden al diseño anterior, con barra lateral oscura y acentos terracota. Conservan la evidencia de esos recorridos, pero no acreditan el contraste ni toda la accesibilidad de la paleta y navegación actuales.

Revisé la compilación de producción local en tamaños de **1280 × 800** y **390 × 844**. Comprobé el tablero vacío, tarjetas pendientes y en curso, ocupación **10 / 10**, mensajes de validación y capacidad, movimientos mediante teclado, retorno del foco y un título largo con etiquetas mostradas como texto. No observé desbordamiento horizontal en esos tamaños ni errores en la consola. Medí 13 pares de colores de texto y fondo, incluidos botones normales, hover, presionados y deshabilitados: todos superaron **4,5:1**. Esto no constituye una auditoría completa de accesibilidad.

En esta revisión visual no forcé errores de lectura o escritura ni esperas prolongadas de guardado, y no hubo tarjetas completadas en los datos de prueba. Quedan pendientes esas comprobaciones, la evaluación con 200 tareas y la matriz de navegadores de los requisitos no funcionales. Las pruebas de datos con almacenamiento y bloqueos simulados se ejecutan con `npm test`; su cobertura está descrita en las historias correspondientes.

### Revisión posterior de HU-05

En esa versión, las tarjetas activas mostraban **Completar tarea** junto al botón de movimiento entre Pendiente y En curso. Al cerrar, el foco pasaba a la tarjeta en Completadas, que mostraba la franja esmeralda y **Tarea cerrada**.

Revisé tarjetas completadas reales de prueba en escritorio a 1280 × 800 y móvil a 390 × 844, incluido un título largo con etiquetas como texto. Se comprobaron teclado y foco, cierre desde ambas columnas, recarga y liberación de una plaza con En curso lleno, sin desbordamiento horizontal ni errores de consola observados. Esta revisión cubre el pendiente visual de tarjetas completadas del ajuste de estilo anterior. La revisión posterior de [HU-06](../04-Casos%20de%20Uso/HU-06.%20Continuar%20con%20mis%20tareas%20guardadas.md#verificación-de-fallos-y-envíos-repetidos) cubre lectura y escritura rechazadas, reintentos y envíos repetidos desde la interfaz. La revisión posterior de [HU-05](../04-Casos%20de%20Uso/HU-05.%20Completar%20una%20tarea.md#verificación-en-navegador-y-pendientes) comprueba el vencimiento de la espera.

### Avance semanal y espera acotada

En la versión revisada entonces, el panel **Avance semanal** se situaba debajo de las columnas, con fondo blanco, intervalo en Lima, cifra terracota y controles **Semana anterior**, **Semana actual** y **Semana siguiente**. El diseño actual mantiene esos controles y usa una cifra negra. El resultado usa texto de estado; un error oculta el conteo y ofrece reintento.

Revisé el panel en escritorio y en una vista móvil inicial de 390 px, sin desbordamiento horizontal observado en esa vista. Comprobé clic, activación con Enter, intervalo, cero válido, actualización al completar, recarga y error ante JSON inválido con recuperación al reintentar. Los casos de límites temporales están en [HU-07](../04-Casos%20de%20Uso/HU-07.%20Revisar%20lo%20que%20termin%C3%A9%20en%20la%20semana.md#verificación-y-pendientes).

En registro, movimiento y finalización observé el mensaje de espera, su vencimiento, recuperación de controles y foco y un reintento correcto. El registro conservó el título; las solicitudes canceladas no modificaron los datos después de liberar el bloqueo. La revisión no sustituye tecnologías de asistencia, la matriz de navegadores ni la medición con Wi-Fi y 4G.

## Revisión de teclado y compatibilidad

El 24 de noviembre de 2026 revisé la compilación de producción local en Windows 11 Home Single Language, compilación 26300. El navegador integrado se identificó como Chromium con `Chrome/158.0.0.0`. Utilicé datos de prueba en orígenes locales separados de los habituales. Las páginas auxiliares fueron temporales y no forman parte de la aplicación.

### Recorridos observados

- **Entrada y estructura:** Tab alcanzó **Saltar al tablero**, Enter enfocó el contenido y el siguiente Tab llegó a **Nueva tarea**. La página expone idioma español, un h1 y encabezados h2 para las columnas y el avance semanal.
- **Formulario:** apertura con foco en el título, navegación hasta Guardar y Cancelar, validación de vacío con retorno al campo, `required`, `aria-invalid` y descripción asociada al error. Guardar con Enter y cancelar con espacio devolvieron el foco a **Nueva tarea**.
- **Tareas:** movimiento con Enter, devolución con espacio y finalización con Enter. El foco se conservó en la acción de la tarea movida y pasó a la tarjeta cerrada al completar. El siguiente Tab permitió continuar hacia la consulta semanal.
- **Consulta semanal:** navegación con Enter y espacio, con foco conservado en los controles. El contorno de foco observado fue de 2 px en terracota. El error de datos se comunicó sin un conteo válido de cero.
- **Listas largas:** con 200 tareas de prueba (20 pendientes, 9 en curso y 171 completadas), recorrí por Tab los controles y las tres listas. End permitió llegar al final de las listas desplazables; la de completadas alcanzó su máximo de desplazamiento de 17 690 px y mostró la tarea 200. El siguiente Tab alcanzó **Semana anterior**. Esto verifica acceso al contenido, no rendimiento.
- **Reflujo:** a 390 × 844 se comprobaron creación, movimiento, finalización y título largo con etiquetas mostradas como texto. No se observó desbordamiento horizontal. Los botones medidos tenían 44 px de alto. Se revisó de nuevo la estructura de controles tras el ajuste de accesibilidad. Es una ventana de escritorio estrecha; no acredita interacción táctil ni un dispositivo móvil real.

### Correcciones realizadas

El reintento del avance semanal eliminaba el botón enfocado y dejaba el foco en `body`. Ahora, al terminar el reintento, enfoca el encabezado **Avance semanal**. Comprobé tanto un segundo error como una recuperación correcta: el foco quedó en ese encabezado y el siguiente Tab llegó a **Semana anterior**.

Las regiones de estado de registro, movimientos y consulta semanal permanecen en el DOM y actualizan su contenido con `role="status"` y `aria-atomic="true"`. El formulario mantiene también su región de alerta desde la apertura. Este cambio sigue la recomendación de establecer la región antes de actualizarla, descrita en [regiones vivas de MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions); la semántica de estado está definida en [WAI-ARIA](https://www.w3.org/TR/wai-aria/#status). La validación escuchada con lector de pantalla sigue pendiente.

### Matriz de combinaciones

| Navegador y versión observada | Sistema / tamaño | Verificación | Estado |
| --- | --- | --- | --- |
| Navegador integrado, UA Chrome/158.0.0.0 | Windows 11 / 1280 × 720 | Teclado, foco, formulario, movimientos, cierre, semanas, errores y listas de 200 tareas. | Recorridos comprobados. |
| Mismo navegador integrado | Windows 11 / 390 × 844 | Formulario, título largo, movimientos, cierre y controles sin desbordamiento. | Reflujo comprobado; sin dispositivo táctil real. |
| Google Chrome 158.0.8127.38 | Windows 11 / ventana de 659 × 1027 px; viewport CSS no medido | Tablero vacío, registro, movimiento, devolución con espacio, cierre con Enter, semana anterior y actual, y persistencia tras recargar. | Recorridos principales comprobados en esta instalación. |
| Microsoft Edge 158.0.4370.33 | Windows 11 / ventana de 1920 × 1032 px; viewport CSS no medido | En el reintento se observaron tablero vacío, registro, movimiento, devolución con espacio y cierre con Enter. | Cobertura parcial: no se registró un resultado observable de consulta semanal y recarga en esta instalación. |
| Opera 140.0.6074.36 | Windows 11 / tamaño sin evaluar | Versión del ejecutable identificada; la herramienta se interrumpió al intentar abrirlo y no se observaron recorridos. | Pendiente. |
| Firefox | Sin instalación localizada | Sin recorridos ejecutados. | Pendiente. |
| Safari, otros sistemas y dispositivos móviles reales | Entorno no disponible en esta sesión | Sin recorridos ejecutados. | Pendiente. |
| Narrador y otros lectores de pantalla | Windows / salida hablada no observable desde las herramientas de esta sesión | Se revisaron nombres, relaciones y regiones de estado en el árbol accesible y DOM. Eso no equivale a escuchar un lector. | Validación hablada pendiente. |

Chrome y Edge se probaron sobre la compilación corregida, en el origen local de prueba y con tareas nuevas identificables. Chrome conservó la tarjeta cerrada y el conteo de 1 al recargar. En Edge, la última llamada de control se interrumpió antes de devolver evidencia de consulta semanal y recarga; esos recorridos no se dan por comprobados. La pestaña de prueba de Chrome y la ventana de Edge abierta para la revisión se cerraron al terminar.

Los números completos de las instalaciones nativas se tomaron de los metadatos de sus ejecutables. El resultado del navegador integrado no se extiende a las instalaciones nativas por compartir motor o número de versión. Tampoco se extiende el resultado de una instalación a otras versiones de esa familia. No se declara cumplida la compatibilidad con las tres últimas versiones estables de todos los navegadores.

### Referencias de versiones al 24 de noviembre de 2026

Las series siguientes sirven para preparar las combinaciones pendientes; cada ejecución debe registrar el número completo de versión, sistema, tamaño y recorridos. Las versiones móviles se deben identificar por separado al probar esos dispositivos.

| Familia de escritorio | Series de referencia | Fuente |
| --- | --- | --- |
| Chrome | 159 en Early Stable, 158 y 157; conservar también 156 como referencia del despliegue general anterior. | [Chrome Releases](https://chromereleases.googleblog.com/2026/11/) y [Chrome 156](https://chromereleases.googleblog.com/2026/10/stable-channel-update-for-desktop_02018666648.html). |
| Edge | 158, 157 y 156. | [Notas estables](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-relnote-stable-channel) y [archivo de versiones](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-relnote-archive-stable-channel). |
| Firefox | 161, 160 y 159. | [Firefox 161](https://www.firefox.com/en-US/firefox/161.0/releasenotes/) y [Firefox 160, con referencia a su predecesora](https://www.firefox.com/en-US/firefox/160.0/releasenotes/). |
| Safari | 27.2, 27.1 y 27.0. | [Notas de Safari](https://developer.apple.com/documentation/safari-release-notes/). |
| Opera | 140, 139 y 138. | [Opera 140](https://blogs.opera.com/desktop/2026/11/opera-140-stable/), [139](https://blogs.opera.com/desktop/2026/10/opera-139-stable/) y [138](https://blogs.opera.com/desktop/2026/10/opera-138-stable/). |

Chrome 159 comenzó su distribución Early Stable a una fracción de usuarios el día de la revisión; se identifica expresamente ese estado. Esta tabla no reduce el objetivo de todos los navegadores a las familias enumeradas: faltan las demás combinaciones y sus referencias de versión.

### Comprobaciones y pendientes

Pasaron `npm test` (96 pruebas), `npm run lint`, `npm run typecheck` y `npm run build`. Se revisaron los cambios de foco y semántica en la compilación resultante. En el navegador integrado no se observaron errores ni advertencias de consola; no se inspeccionó la consola de las instalaciones nativas. La salida hablada con tecnologías de asistencia, las combinaciones pendientes de la matriz y el rendimiento bajo Wi-Fi y 4G siguen abiertos.
