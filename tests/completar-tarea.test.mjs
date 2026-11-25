import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { randomUUID } from "node:crypto";
import { completarTarea, moverTarea, registrarTarea, CLAVE_TAREAS } from "./soporte/modulos-tareas.mjs";
import { prepararAlmacenamiento } from "./soporte/almacenamiento-tareas.mjs";

const descriptorWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const FechaReal = Date;
const instanteInicial = "2026-11-24T23:30:00.000Z";
let entorno;

afterEach(() => {
  globalThis.Date = FechaReal;
  if (descriptorWindow) Object.defineProperty(globalThis, "window", descriptorWindow);
  else delete globalThis.window;
  for (const peticion of entorno.bloqueos) {
    assert.equal(peticion.nombre, CLAVE_TAREAS);
    assert.equal(peticion.opciones.mode, "exclusive");
    assert.ok(peticion.opciones.signal instanceof AbortSignal);
  }
  assert.ok(entorno.operaciones.every((operacion) => operacion.bajoBloqueo));
});

function fijarHora(instante) {
  globalThis.Date = class extends FechaReal {
    constructor(...argumentos) {
      if (argumentos.length === 0) super(instante);
      else super(...argumentos);
    }
  };
}

function preparar(tareas, espera) {
  entorno = prepararAlmacenamiento(JSON.stringify(tareas), espera);
  fijarHora(instanteInicial);
}

function tarea(estado = "pendiente") {
  return { id: randomUUID(), titulo: "Preparar presentación <b>como texto</b>", estado, fecha_finalizacion: estado === "completada" ? "2026-11-23T14:00:00.000Z" : null };
}

function escrituras() {
  return entorno.operaciones.filter((operacion) => operacion.tipo === "escritura");
}

test("01. Completar desde Pendiente guarda estado y fecha UTC juntos y conserva las demás tareas", async () => {
  const pendiente = tarea(); const otras = [tarea("en_curso"), tarea("completada")];
  preparar([pendiente, ...otras]);
  const resultado = await completarTarea(pendiente.id);
  const esperadas = [{ ...pendiente, estado: "completada", fecha_finalizacion: instanteInicial }, ...otras];
  assert.deepEqual(resultado, { estado: "guardada", tareas: esperadas });
  assert.deepEqual(JSON.parse(entorno.contenido), esperadas);
  assert.equal(escrituras().length, 1);
});

test("02. Completar desde En curso conserva identidad y título sin duplicar", async () => {
  const actual = tarea("en_curso"); preparar([actual]);
  assert.equal((await completarTarea(actual.id)).estado, "guardada");
  assert.deepEqual(JSON.parse(entorno.contenido), [{ ...actual, estado: "completada", fecha_finalizacion: instanteInicial }]);
  assert.equal(escrituras().length, 1);
});

test("03. Completar con diez en curso libera una plaza que puede ocupar otro pendiente", async () => {
  const enCurso = Array.from({ length: 10 }, () => tarea("en_curso")); const pendiente = tarea();
  preparar([...enCurso, pendiente]);
  const cierre = await completarTarea(enCurso[0].id);
  assert.equal(cierre.estado, "guardada");
  assert.equal(cierre.tareas.filter((actual) => actual.estado === "en_curso").length, 9);
  assert.equal((await moverTarea(pendiente.id, "en_curso")).estado, "guardada");
  const guardadas = JSON.parse(entorno.contenido);
  assert.equal(guardadas.filter((actual) => actual.estado === "en_curso").length, 10);
  assert.equal(guardadas.length, 11);
  assert.equal(guardadas[0].fecha_finalizacion, instanteInicial);
});

test("04. Repetir la finalización conserva la fecha original sin escribir, aunque la escritura esté bloqueada", async () => {
  const cerrada = tarea("completada"); preparar([cerrada]); entorno.falloEscritura = true;
  assert.deepEqual(await completarTarea(cerrada.id), { estado: "guardada", tareas: [cerrada] });
  assert.deepEqual(JSON.parse(entorno.contenido), [cerrada]);
  assert.equal(escrituras().length, 0);
});

test("05. Una tarea ausente devuelve la colección vigente sin escribir", async () => {
  const existente = tarea(); preparar([existente]);
  assert.deepEqual(await completarTarea(randomUUID()), { estado: "error", motivo: "no_encontrada", tareas: [existente] });
  assert.equal(escrituras().length, 0);
});

test("06. Un fallo de lectura impide completar y escribir", async () => {
  const pendiente = tarea(); preparar([pendiente]); entorno.falloLectura = true;
  assert.deepEqual(await completarTarea(pendiente.id), { estado: "error", motivo: "acceso" });
  assert.equal(escrituras().length, 0);
});

test("07. El JSON dañado no se reinicia ni se sobrescribe", async () => {
  preparar([]); entorno.contenido = "{";
  assert.deepEqual(await completarTarea(randomUUID()), { estado: "error", motivo: "datos" });
  assert.equal(entorno.contenido, "{");
  assert.equal(escrituras().length, 0);
});

test("08. Una completada con fecha inválida se rechaza sin reemplazar su fecha", async () => {
  const invalida = { ...tarea("completada"), fecha_finalizacion: null }; preparar([invalida]);
  assert.deepEqual(await completarTarea(invalida.id), { estado: "error", motivo: "datos" });
  assert.deepEqual(JSON.parse(entorno.contenido), [invalida]);
  assert.equal(escrituras().length, 0);
});

test("09. Sin Web Locks no se lee ni se escribe", async () => {
  preparar([]); delete entorno.navegador.locks;
  assert.deepEqual(await completarTarea(randomUUID()), { estado: "error", motivo: "navegador" });
  assert.deepEqual(entorno.operaciones, []);
});

test("10. Un bloqueo rechazado no confirma la finalización", async () => {
  preparar([]); entorno.falloBloqueo = true;
  assert.deepEqual(await completarTarea(randomUUID()), { estado: "error", motivo: "guardado" });
  assert.deepEqual(entorno.operaciones, []);
});

for (const [indice, estado] of ["pendiente", "en_curso"].entries()) {
  test(`${11 + indice}. Un fallo al completar desde ${estado} conserva estado y fecha sin finalización parcial`, async () => {
    const actual = tarea(estado); preparar([actual]); entorno.falloEscritura = true;
    assert.deepEqual(await completarTarea(actual.id), { estado: "error", motivo: "guardado" });
    assert.deepEqual(JSON.parse(entorno.contenido), [actual]);
    assert.equal(escrituras().length, 1);
  });
}

test("13. Reintentar tras una escritura fallida guarda una sola finalización con la hora del intento exitoso", async () => {
  const pendiente = tarea(); preparar([pendiente]); entorno.falloEscritura = true;
  assert.equal((await completarTarea(pendiente.id)).estado, "error");
  entorno.falloEscritura = false;
  const posterior = "2026-11-25T00:10:00.000Z"; fijarHora(posterior);
  assert.equal((await completarTarea(pendiente.id)).estado, "guardada");
  assert.deepEqual(JSON.parse(entorno.contenido), [{ ...pendiente, estado: "completada", fecha_finalizacion: posterior }]);
});

test("14. La finalización espera el bloqueo sin confirmar y obtiene la fecha dentro de él", async () => {
  let liberar; const pendiente = tarea();
  preparar([pendiente], new Promise((resolve) => { liberar = resolve; }));
  let terminado = false;
  const cierre = completarTarea(pendiente.id).then((resultado) => { terminado = true; return resultado; });
  await new Promise(setImmediate);
  assert.equal(terminado, false); assert.deepEqual(entorno.operaciones, []);
  const posterior = "2026-11-25T01:00:00.000Z"; fijarHora(posterior); liberar();
  const resultado = await cierre;
  assert.equal(resultado.estado, "guardada");
  assert.equal(resultado.tareas[0].fecha_finalizacion, posterior);
});

test("15. Dos finalizaciones encoladas de la misma tarea escriben una sola fecha y un solo registro", async () => {
  let liberar; const pendiente = tarea();
  preparar([pendiente], new Promise((resolve) => { liberar = resolve; }));
  const primera = completarTarea(pendiente.id); const segunda = completarTarea(pendiente.id);
  assert.equal(entorno.bloqueos.length, 2); assert.deepEqual(entorno.operaciones, []); liberar();
  const resultados = await Promise.all([primera, segunda]);
  assert.ok(resultados.every((resultado) => resultado.estado === "guardada"));
  assert.deepEqual(resultados[0].tareas, resultados[1].tareas);
  assert.deepEqual(JSON.parse(entorno.contenido), [{ ...pendiente, estado: "completada", fecha_finalizacion: instanteInicial }]);
  assert.equal(escrituras().length, 1);
});

test("16. Una finalización seguida de un movimiento encolado rechaza la reapertura", async () => {
  let liberar; const pendiente = tarea();
  preparar([pendiente], new Promise((resolve) => { liberar = resolve; }));
  const cierre = completarTarea(pendiente.id); const movimiento = moverTarea(pendiente.id, "en_curso"); liberar();
  assert.equal((await cierre).estado, "guardada");
  assert.equal((await movimiento).motivo, "completada");
  assert.equal(escrituras().length, 1);
  assert.equal(JSON.parse(entorno.contenido)[0].fecha_finalizacion, instanteInicial);
});

test("17. Un movimiento seguido de una finalización encolada conserva el cierre y la misma identidad", async () => {
  let liberar; const pendiente = tarea();
  preparar([pendiente], new Promise((resolve) => { liberar = resolve; }));
  const movimiento = moverTarea(pendiente.id, "en_curso"); const cierre = completarTarea(pendiente.id); liberar();
  assert.equal((await movimiento).estado, "guardada"); assert.equal((await cierre).estado, "guardada");
  assert.deepEqual(JSON.parse(entorno.contenido), [{ ...pendiente, estado: "completada", fecha_finalizacion: instanteInicial }]);
});

test("18. Registro y finalización comparten el bloqueo y conservan ambos cambios", async () => {
  let liberar; const pendiente = tarea();
  preparar([pendiente], new Promise((resolve) => { liberar = resolve; }));
  const registro = registrarTarea("Nuevo pendiente"); const cierre = completarTarea(pendiente.id); liberar();
  assert.equal((await registro).estado, "guardada"); assert.equal((await cierre).estado, "guardada");
  const guardadas = JSON.parse(entorno.contenido);
  assert.equal(guardadas.length, 2);
  assert.deepEqual(guardadas[0], { ...pendiente, estado: "completada", fecha_finalizacion: instanteInicial });
  assert.equal(guardadas[1].titulo, "Nuevo pendiente"); assert.equal(guardadas[1].estado, "pendiente");
});

test("19. Una tarea completada mientras se espera mantiene la fecha vigente sin escribir", async () => {
  let liberar; const pendiente = tarea();
  preparar([pendiente], new Promise((resolve) => { liberar = resolve; }));
  const cierre = completarTarea(pendiente.id);
  const cerrada = { ...pendiente, estado: "completada", fecha_finalizacion: "2026-11-24T22:00:00.000Z" };
  entorno.contenido = JSON.stringify([cerrada]); liberar();
  assert.deepEqual(await cierre, { estado: "guardada", tareas: [cerrada] });
  assert.equal(escrituras().length, 0);
});

test("20. Un fallo al obtener la fecha no modifica los datos ni confirma éxito", async () => {
  const pendiente = tarea(); preparar([pendiente]);
  globalThis.Date = class extends FechaReal {
    toISOString() { throw new Error("Fecha no disponible"); }
  };
  assert.deepEqual(await completarTarea(pendiente.id), { estado: "error", motivo: "guardado" });
  assert.deepEqual(JSON.parse(entorno.contenido), [pendiente]);
  assert.equal(escrituras().length, 0);
});
