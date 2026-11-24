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

**Prototipos documentados.** Las imágenes siguen siendo referencias de baja fidelidad. HU-01 implementa una primera interfaz con fondo oscuro y acentos naranja, columnas paralelas en escritorio y apiladas en móvil, títulos, ocupación de En curso y estados de carga, vacío y error. HU-02 añade el botón **Nueva tarea** y un formulario con título, validación, guardado, cancelación y errores. Los movimientos y el avance semanal siguen pendientes.

La revisión visual inicial se describe en [HU-01](../04-Casos%20de%20Uso/HU-01.%20Consultar%20mi%20tablero.md#verificación-de-esta-entrega), y la del formulario y tareas registradas en [HU-02](../04-Casos%20de%20Uso/HU-02.%20Registrar%20un%20pendiente.md#verificación-en-navegador-y-pendientes). Las capturas del prototipo no acreditan pruebas de funcionamiento ni la compatibilidad completa. El comportamiento esperado se conserva en los requisitos y en los [flujos de una tarea](../06-Arquitectura/Flujos.md).
