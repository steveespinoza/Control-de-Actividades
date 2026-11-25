# Pantallas — Control de Actividades

Estas dos vistas presentan una propuesta inicial de distribución del tablero en escritorio y móvil. **Son prototipos de baja fidelidad:** sirven para revisar la organización de la información y las acciones principales.

La versión terminada del MVP incorporará estilos, tipografía, espaciado, botones adicionales y estados de interacción para las funciones definidas en los [requisitos funcionales](../02-Requisitos/Requisitos-Funcionales.md). Las imágenes no cierran el aspecto final ni representan todos los controles que tendrá la aplicación.

## Vista de escritorio

![Prototipo de escritorio: barra lateral, acción Nueva Actividad y tres columnas con tarjetas ilustrativas.](../../Vista%20Desktop.jpeg)

La propuesta utiliza una barra lateral con la identificación del proyecto y el acceso al tablero. En la zona principal sitúa la acción de creación en la parte superior y distribuye los tres estados en columnas paralelas, con las tareas representadas como tarjetas.

Las tarjetas con el texto «Actividad» son contenido ilustrativo del prototipo. En la aplicación deberán mostrar el título de cada tarea guardada.

## Vista móvil

![Prototipo móvil: acción Nueva Actividad, selector de estados y tarjetas de la columna Pendiente en una distribución vertical.](../../Vista%20Movil.jpeg)

La propuesta sitúa la acción de creación arriba, seguida de un selector de estados. La captura muestra la vista de **Pendiente**, con las tarjetas organizadas verticalmente. Esta distribución plantea cómo recorrer el tablero en una pantalla estrecha; la navegación y la interacción táctil todavía deben implementarse y verificarse.

## Detalles que se completarán en el MVP

- **Presentación visual:** aplicar los estilos y ajustar colores, tipografía, tamaños, separación y adaptación a distintos tamaños de pantalla.
- **Textos:** alinear los rótulos del prototipo con el dominio de tareas y con los estados **Pendiente**, **En curso** y **Completadas**. Las imágenes conservan los rótulos iniciales «Nueva Actividad», «En proceso» y «Completado».
- **Acciones:** incorporar los botones y controles necesarios para registrar y mover tareas dentro de las reglas definidas. Las tareas completadas mantendrán su cierre definitivo.
- **Información del tablero:** mostrar la ocupación y el máximo de 10 tareas en curso, así como la consulta del avance semanal conforme a las [historias de usuario](../04-Casos%20de%20Uso/Historias-de-Usuario.md).
- **Estados de la interfaz:** completar carga, tablero vacío, guardado en curso y errores, junto con las validaciones del formulario.
- **Accesibilidad:** permitir el uso con teclado, foco visible y controles legibles. Si se incorpora arrastrar y soltar, ofrecer una alternativa para mover tareas sin arrastrar, según los [requisitos no funcionales](../02-Requisitos/Requisitos-No-Funcionales.md).

Estos ajustes completan la interfaz del alcance vigente. Las imágenes se mantienen como referencia del prototipo, sin convertir los elementos ilustrativos en funciones adicionales.

## Estado

**Prototipos documentados e interfaz en desarrollo.** Las imágenes siguen siendo referencias de baja fidelidad. La interfaz actual utiliza un lienzo claro, cabecera blanca y barra lateral oscura, con terracota para la identidad y la acción principal. Las columnas se muestran paralelas en escritorio y apiladas en móvil. HU-01 permite consultar títulos, ocupación de En curso y estados de carga, vacío y error. HU-02 añade el registro. HU-03 incorpora **Pasar a En curso** y **Volver a Pendiente**, mensajes de espera, éxito y error, y conservación del foco. La finalización y el avance semanal siguen pendientes.

La revisión visual inicial se describe en [HU-01](../04-Casos%20de%20Uso/HU-01.%20Consultar%20mi%20tablero.md#verificación-de-esta-entrega), y la del formulario y tareas registradas en [HU-02](../04-Casos%20de%20Uso/HU-02.%20Registrar%20un%20pendiente.md#verificación-en-navegador-y-pendientes). Las capturas del prototipo no acreditan pruebas de funcionamiento ni la compatibilidad completa. El comportamiento esperado se conserva en los requisitos y en los [flujos de una tarea](../06-Arquitectura/Flujos.md).

La revisión de movimientos, teclado y límite de capacidad en producción local está en [HU-03](../04-Casos%20de%20Uso/HU-03.%20Actualizar%20lo%20que%20estoy%20haciendo.md#verificación-en-navegador-y-pendientes). Se utilizaron botones, sin implementar arrastrar y soltar.

## Presentación actual y verificación

La cabecera reúne **Mi tablero**, **Datos en este navegador** y **Nueva tarea**. Las pistas grises contienen tarjetas blancas con franja ámbar en Pendiente, terracota en En curso y esmeralda en Completadas. Los encabezados y contadores también identifican cada estado mediante texto. Las tarjetas completadas incluyen el indicador **Tarea cerrada** y no ofrecen controles de reapertura. En escritorio, las listas permiten desplazamiento vertical con teclado; en móvil, la navegación pasa a una cabecera compacta.

Revisé la compilación de producción local en tamaños de **1280 × 800** y **390 × 844**. Comprobé el tablero vacío, tarjetas pendientes y en curso, ocupación **10 / 10**, mensajes de validación y capacidad, movimientos mediante teclado, retorno del foco y un título largo con etiquetas mostradas como texto. No observé desbordamiento horizontal en esos tamaños ni errores en la consola. Medí 13 pares de colores de texto y fondo, incluidos botones normales, hover, presionados y deshabilitados: todos superaron **4,5:1**. Esto no constituye una auditoría completa de accesibilidad.

En esta revisión visual no forcé errores de lectura o escritura ni esperas prolongadas de guardado, y no hubo tarjetas completadas en los datos de prueba. Quedan pendientes esas comprobaciones, la evaluación con 200 tareas y la matriz de navegadores de los requisitos no funcionales. Las pruebas de datos con almacenamiento y bloqueos simulados se ejecutan con `npm test`; su cobertura está descrita en las historias correspondientes.
