# Requisitos funcionales

El sistema permite a una sola persona organizar sus pendientes en un tablero, limitar el trabajo en curso y revisar su avance semanal. El actor es el [Usuario](../01-Usuarios/Rol%20-%20Usuario.md).

Estos requisitos se basan en [Problema y objetivo](../00-Inicio/Problema-y-Objetivo.md) y en la decisión de permitir un máximo de **10 tareas en curso**. Describen el comportamiento esperado; todavía no representan funcionalidades implementadas ni pruebas realizadas.

## RF-01. Consultar el tablero personal

**Descripción:** el usuario debe poder consultar sus tareas en un solo tablero organizado en las columnas **Pendiente**, **En curso** y **Completadas**.

**Criterios de aceptación:**

- Cada tarea debe aparecer en una sola columna, de acuerdo con su estado actual.
- Al abrir la aplicación, el usuario debe acceder directamente al tablero, sin pantalla de inicio de sesión ni solicitud de credenciales.
- El tablero debe mostrar el título de cada tarea para reconocer el pendiente sin abrir otra pantalla.
- Si no hay tareas, debe mostrar las tres columnas vacías y permitir crear la primera.
- Al volver a abrir el tablero, debe mostrar las tareas registradas y sus estados guardados.

## RF-02. Crear una tarea

**Descripción:** el usuario debe poder registrar un nuevo pendiente desde el tablero.

**Criterios de aceptación:**

- La creación debe exigir un título que no esté vacío ni compuesto únicamente por espacios.
- Al guardar correctamente, la tarea debe aparecer en **Pendiente**.
- Si el registro falla, el sistema debe comunicarlo y no mostrar la tarea como guardada.
- Crear una tarea en **Pendiente** debe seguir siendo posible aunque **En curso** haya alcanzado su límite.

## RF-03. Mover una tarea entre columnas

**Descripción:** el usuario debe poder mover las tareas pendientes o en curso entre las columnas **Pendiente**, **En curso** y **Completadas**. Una tarea completada queda cerrada y no puede volver a abrirse.

**Criterios de aceptación:**

- Al confirmar un movimiento, la misma tarea debe dejar de aparecer en la columna de origen y aparecer en la de destino.
- Mover una tarea debe conservar su título y no generar una copia del pendiente.
- Todo movimiento hacia **En curso** debe cumplir el límite de RF-04.
- Las tareas en **Completadas** deben permanecer en esa columna. El sistema debe rechazar cualquier intento de devolverlas a **Pendiente** o **En curso** y no ofrecer controles para reabrirlas.
- Si el movimiento falla, el sistema debe comunicarlo y conservar o restaurar el estado anterior.

## RF-04. Limitar las tareas en curso

**Descripción:** el sistema debe permitir un máximo de **10 tareas simultáneas** en **En curso**, para ayudar al usuario a concentrarse en una cantidad acotada de pendientes.

**Criterios de aceptación:**

- Si hay menos de 10 tareas en **En curso**, debe permitir ingresar otra tarea hasta alcanzar el máximo.
- Si ya hay 10, debe rechazar el ingreso de una tarea adicional y mantenerla en su columna de origen.
- Al rechazar el movimiento, debe informar que se alcanzó el límite y que es necesario sacar una tarea de **En curso** antes de ingresar otra.
- Debe mostrar cuántas tareas ocupan la columna y el máximo permitido, por ejemplo, **7 de 10**.
- El límite no debe impedir sacar tareas de **En curso** hacia **Pendiente** o **Completadas**.

## RF-05. Conservar los pendientes y sus cambios

**Descripción:** el sistema debe guardar las tareas y sus estados para que el tablero pueda utilizarse diariamente como lugar de consulta de los pendientes.

**Criterios de aceptación:**

- Después de crear una tarea o cambiarla de columna, recargar la página debe conservar la información guardada.
- Todas las tareas y sus cambios deben guardarse en **localStorage desde el inicio del desarrollo**, independientemente de su estado.
- La persistencia conserva títulos, estados y fechas de finalización en el mismo navegador y sitio, mientras se mantengan sus datos locales. No se define sincronización entre navegadores o dispositivos.
- No se implementan respaldos ni restauración. Si se borran los datos del sitio o del navegador, las tareas no pueden recuperarse desde la aplicación.
- Abrir nuevamente la aplicación debe recuperar el estado guardado del tablero.
- El sistema no debe informar que una operación se completó correctamente si no pudo guardar el cambio.
- El guardado debe respetar el máximo de 10 tareas en **En curso**, también si se intenta ingresar tareas desde dos pestañas al mismo tiempo.

## RF-06. Consultar el avance semanal

**Descripción:** el usuario debe poder ver cuántas tareas terminó cada semana para reconocer el trabajo realizado.

**Criterios de aceptación:**

- Al mover una tarea a **Completadas**, el sistema debe registrar su fecha de finalización. Esa fecha debe conservarse y utilizarse para determinar la semana en la que terminó.
- Cada semana debe comenzar el **lunes a las 00:00**, en la zona horaria **America/Lima (Perú)**, e incluir los instantes anteriores al lunes siguiente a las 00:00. El comienzo del lunes siguiente pertenece a la nueva semana.
- La consulta debe mostrar el número de tareas terminadas y el intervalo de fechas de la semana consultada.
- Si no se terminaron tareas en ese periodo, debe mostrar **0**.
- Cada tarea debe contarse una sola vez, en la semana de su finalización. Las tareas completadas no pueden reabrirse, según RF-03.
- Una recarga de la página o un intento repetido de completar la misma tarea no debe incrementar el conteo ni registrar otra finalización.
