import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { randomUUID } from "node:crypto";
import { moverTarea, registrarTarea, CLAVE_TAREAS } from "./soporte/modulos-tareas.mjs";
import { prepararAlmacenamiento } from "./soporte/almacenamiento-tareas.mjs";

const descriptorWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
let entorno;

afterEach(() => {
  if (descriptorWindow) Object.defineProperty(globalThis, "window", descriptorWindow);
  else delete globalThis.window;
  for (const peticion of entorno.bloqueos) {
    assert.equal(peticion.nombre, CLAVE_TAREAS);
    assert.deepEqual(peticion.opciones, { mode: "exclusive" });
  }
  assert.ok(entorno.operaciones.every((operacion) => operacion.bajoBloqueo));
});

function preparar(tareas, espera) {
  entorno = prepararAlmacenamiento(JSON.stringify(tareas), espera);
}

function tarea(estado = "pendiente") {
  return { id: randomUUID(), titulo: "Tarea de prueba", estado, fecha_finalizacion: estado === "completada" ? "2026-11-24T16:00:00.000Z" : null };
}

function sinEscrituras() {
  assert.ok(entorno.operaciones.every((op) => op.tipo === "lectura"));
}

test("01. Pasar a En curso conserva identidad, título, fecha nula y demás tareas", async () => {
  const pendiente = tarea(); const otras = [tarea("en_curso"), tarea("completada")];
  preparar([pendiente, ...otras]);
  const resultado = await moverTarea(pendiente.id, "en_curso");
  assert.equal(resultado.estado, "guardada");
  assert.deepEqual(resultado.tareas, [{ ...pendiente, estado: "en_curso" }, ...otras]);
  assert.deepEqual(JSON.parse(entorno.contenido), resultado.tareas);
});

test("02. Volver a Pendiente conserva identificador, título y fecha nula", async () => {
  const actual = tarea("en_curso"); preparar([actual]);
  const resultado = await moverTarea(actual.id, "pendiente");
  assert.equal(resultado.estado, "guardada");
  assert.deepEqual(JSON.parse(entorno.contenido), [{ ...actual, estado: "pendiente" }]);
});

test("03. Salir de En curso lleno libera una plaza", async () => {
  const tareas = Array.from({ length: 10 }, () => tarea("en_curso")); preparar(tareas);
  const resultado = await moverTarea(tareas[0].id, "pendiente");
  assert.equal(resultado.estado, "guardada");
  assert.equal(resultado.tareas.filter((t) => t.estado === "en_curso").length, 9);
});

test("04. En curso lleno rechaza otro ingreso sin escribir", async () => {
  const pendiente = tarea(); const tareas = [...Array.from({ length: 10 }, () => tarea("en_curso")), pendiente]; preparar(tareas);
  const anterior = entorno.contenido;
  assert.deepEqual(await moverTarea(pendiente.id, "en_curso"), { estado: "error", motivo: "capacidad", tareas });
  assert.equal(entorno.contenido, anterior); sinEscrituras();
});

test("05. El ingreso que ocupa la décima plaza se guarda", async () => {
  const pendiente = tarea(); preparar([...Array.from({ length: 9 }, () => tarea("en_curso")), pendiente]);
  const resultado = await moverTarea(pendiente.id, "en_curso");
  assert.equal(resultado.estado, "guardada");
  assert.equal(resultado.tareas.filter((t) => t.estado === "en_curso").length, 10);
});

test("06. Una completada no puede volver a En curso", async () => {
  const completada = tarea("completada"); preparar([completada]);
  assert.deepEqual(await moverTarea(completada.id, "en_curso"), { estado: "error", motivo: "completada", tareas: [completada] });
  assert.deepEqual(JSON.parse(entorno.contenido), [completada]); sinEscrituras();
});

test("07. Una completada no puede volver a Pendiente ni perder su fecha", async () => {
  const completada = tarea("completada"); preparar([completada]);
  assert.equal((await moverTarea(completada.id, "pendiente")).motivo, "completada");
  assert.deepEqual(JSON.parse(entorno.contenido), [completada]); sinEscrituras();
});

test("08. Una tarea ausente devuelve la colección vigente sin escribir", async () => {
  preparar([]);
  assert.deepEqual(await moverTarea(randomUUID(), "en_curso"), { estado: "error", motivo: "no_encontrada", tareas: [] });
  sinEscrituras();
});

test("09. Un destino fuera de HU-03 se rechaza antes de leer", async () => {
  preparar([]);
  assert.deepEqual(await moverTarea(randomUUID(), "completada"), { estado: "error", motivo: "destino" });
  assert.deepEqual(entorno.operaciones, []);
});

test("10. Repetir el estado ya guardado no escribe, incluso con En curso lleno", async () => {
  const tareas = Array.from({ length: 10 }, () => tarea("en_curso")); preparar(tareas);
  assert.deepEqual(await moverTarea(tareas[0].id, "en_curso"), { estado: "guardada", tareas });
  sinEscrituras();
});

test("11. Un fallo de escritura conserva el estado anterior sin confirmar éxito", async () => {
  const pendiente = tarea(); preparar([pendiente]); entorno.falloEscritura = true;
  assert.deepEqual(await moverTarea(pendiente.id, "en_curso"), { estado: "error", motivo: "guardado" });
  assert.deepEqual(JSON.parse(entorno.contenido), [pendiente]);
});

test("12. Un fallo de lectura impide escribir", async () => {
  const pendiente = tarea(); preparar([pendiente]); entorno.falloLectura = true;
  assert.deepEqual(await moverTarea(pendiente.id, "en_curso"), { estado: "error", motivo: "acceso" }); sinEscrituras();
});

test("13. Los datos dañados no se reinician ni se sobrescriben", async () => {
  preparar([]); entorno.contenido = "{";
  assert.deepEqual(await moverTarea(randomUUID(), "en_curso"), { estado: "error", motivo: "datos" });
  assert.equal(entorno.contenido, "{"); sinEscrituras();
});

test("14. Sin Web Locks no hay acceso al almacenamiento", async () => {
  preparar([]); delete entorno.navegador.locks;
  assert.deepEqual(await moverTarea(randomUUID(), "en_curso"), { estado: "error", motivo: "navegador" });
  assert.deepEqual(entorno.operaciones, []);
});

test("15. Un bloqueo rechazado no confirma el movimiento", async () => {
  preparar([]); entorno.falloBloqueo = true;
  assert.deepEqual(await moverTarea(randomUUID(), "en_curso"), { estado: "error", motivo: "guardado" });
  assert.deepEqual(entorno.operaciones, []);
});

test("16. La capacidad se lee después de obtener el bloqueo", async () => {
  let liberar; const pendiente = tarea();
  preparar([pendiente], new Promise((resolve) => { liberar = resolve; }));
  let terminado = false;
  const movimiento = moverTarea(pendiente.id, "en_curso").then((resultado) => { terminado = true; return resultado; });
  await new Promise(setImmediate);
  assert.equal(terminado, false); assert.deepEqual(entorno.operaciones, []);
  const actuales = [...Array.from({ length: 10 }, () => tarea("en_curso")), pendiente];
  entorno.contenido = JSON.stringify(actuales); liberar();
  assert.deepEqual(await movimiento, { estado: "error", motivo: "capacidad", tareas: actuales }); sinEscrituras();
});

test("17. Dos ingresos encolados desde nueve en curso no producen once", async () => {
  let liberar; const pendientes = [tarea(), tarea()];
  preparar([...Array.from({ length: 9 }, () => tarea("en_curso")), ...pendientes], new Promise((resolve) => { liberar = resolve; }));
  const primero = moverTarea(pendientes[0].id, "en_curso"); const segundo = moverTarea(pendientes[1].id, "en_curso");
  assert.equal(entorno.bloqueos.length, 2); assert.deepEqual(entorno.operaciones, []); liberar();
  const resultados = await Promise.all([primero, segundo]);
  assert.equal(resultados[0].estado, "guardada"); assert.equal(resultados[1].motivo, "capacidad");
  const guardadas = JSON.parse(entorno.contenido);
  assert.equal(guardadas.filter((t) => t.estado === "en_curso").length, 10);
  assert.equal(guardadas.length, 11); assert.equal(new Set(guardadas.map((t) => t.id)).size, 11);
});

test("18. Registro y movimiento comparten el bloqueo y conservan ambos cambios", async () => {
  let liberar; const pendiente = tarea();
  preparar([pendiente], new Promise((resolve) => { liberar = resolve; }));
  const registro = registrarTarea("Nuevo pendiente"); const movimiento = moverTarea(pendiente.id, "en_curso");
  assert.equal(entorno.bloqueos.length, 2); assert.deepEqual(entorno.operaciones, []); liberar();
  assert.equal((await registro).estado, "guardada"); assert.equal((await movimiento).estado, "guardada");
  const guardadas = JSON.parse(entorno.contenido);
  assert.equal(guardadas.length, 2); assert.equal(guardadas[0].estado, "en_curso");
  assert.equal(guardadas[1].titulo, "Nuevo pendiente"); assert.equal(guardadas[1].estado, "pendiente");
});

test("19. Una tarea completada durante la espera permanece cerrada", async () => {
  let liberar; const pendiente = tarea();
  preparar([pendiente], new Promise((resolve) => { liberar = resolve; }));
  const movimiento = moverTarea(pendiente.id, "en_curso");
  const completada = { ...pendiente, estado: "completada", fecha_finalizacion: "2026-11-24T18:00:00.000Z" };
  entorno.contenido = JSON.stringify([completada]); liberar();
  assert.equal((await movimiento).motivo, "completada");
  assert.deepEqual(JSON.parse(entorno.contenido), [completada]); sinEscrituras();
});

test("20. Dos solicitudes del mismo destino escriben una sola vez y no duplican", async () => {
  let liberar; const pendiente = tarea();
  preparar([pendiente], new Promise((resolve) => { liberar = resolve; }));
  const primero = moverTarea(pendiente.id, "en_curso"); const segundo = moverTarea(pendiente.id, "en_curso"); liberar();
  assert.ok((await Promise.all([primero, segundo])).every((r) => r.estado === "guardada"));
  assert.equal(entorno.operaciones.filter((op) => op.tipo === "escritura").length, 1);
  assert.deepEqual(JSON.parse(entorno.contenido), [{ ...pendiente, estado: "en_curso" }]);
});

test("21. Reintentar tras fallar la escritura mueve la misma tarea una sola vez", async () => {
  const pendiente = tarea(); preparar([pendiente]); entorno.falloEscritura = true;
  assert.equal((await moverTarea(pendiente.id, "en_curso")).estado, "error"); entorno.falloEscritura = false;
  assert.equal((await moverTarea(pendiente.id, "en_curso")).estado, "guardada");
  assert.deepEqual(JSON.parse(entorno.contenido), [{ ...pendiente, estado: "en_curso" }]);
});
