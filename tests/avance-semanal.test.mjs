import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { randomUUID } from "node:crypto";
import { calcularAvanceSemanal, leerTareas, completarTarea } from "./soporte/modulos-tareas.mjs";
import { prepararAlmacenamiento } from "./soporte/almacenamiento-tareas.mjs";

const descriptorWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const zonaOriginal = process.env.TZ;
afterEach(() => {
  if (descriptorWindow) Object.defineProperty(globalThis, "window", descriptorWindow);
  else delete globalThis.window;
  if (zonaOriginal === undefined) delete process.env.TZ;
  else process.env.TZ = zonaOriginal;
});

const referencia = new Date("2026-11-24T17:00:00.000Z");
function completada(fecha) {
  return { id: randomUUID(), titulo: "Tarea cerrada", estado: "completada", fecha_finalizacion: fecha };
}

test("La semana de Lima empieza el lunes a las 05:00 UTC y muestra lunes a domingo", () => {
  assert.deepEqual(calcularAvanceSemanal([], referencia), {
    inicio: "2026-11-23T05:00:00.000Z", fin: "2026-11-30T05:00:00.000Z",
    intervalo: "Del 23 de noviembre de 2026 al 29 de noviembre de 2026", total: 0,
  });
});

test("Una finalización anterior al lunes y otra exactamente en él pertenecen a semanas distintas", () => {
  const tareas = [completada("2026-11-23T04:59:59.999Z"), completada("2026-11-23T05:00:00.000Z")];
  assert.equal(calcularAvanceSemanal(tareas, referencia, -1).total, 1);
  assert.equal(calcularAvanceSemanal(tareas, referencia).total, 1);
});

test("El lunes siguiente queda excluido y el último milisegundo del domingo queda incluido", () => {
  const tareas = [completada("2026-11-30T04:59:59.999Z"), completada("2026-11-30T05:00:00.000Z")];
  assert.equal(calcularAvanceSemanal(tareas, referencia).total, 1);
  assert.equal(calcularAvanceSemanal(tareas, referencia, 1).total, 1);
});

test("Aunque sea lunes en UTC, antes de las 05:00 todavía es la semana anterior en Lima", () => {
  const anterior = calcularAvanceSemanal([], new Date("2026-11-23T04:59:59.999Z"));
  const nueva = calcularAvanceSemanal([], new Date("2026-11-23T05:00:00.000Z"));
  assert.equal(anterior.inicio, "2026-11-16T05:00:00.000Z");
  assert.equal(nueva.inicio, "2026-11-23T05:00:00.000Z");
});

test("Pendientes y tareas en curso no se cuentan", () => {
  const tareas = ["pendiente", "en_curso"].map((estado) => ({ id: randomUUID(), titulo: "Activa", estado, fecha_finalizacion: null }));
  tareas.push(completada("2026-11-24T16:00:00.000Z"));
  assert.equal(calcularAvanceSemanal(tareas, referencia).total, 1);
});

test("Una colección válida sin cierres en el periodo devuelve cero", () => {
  assert.equal(calcularAvanceSemanal([completada("2026-11-01T12:00:00Z")], referencia).total, 0);
});

test("La navegación conserva los límites al cruzar año y mes", () => {
  const semana = calcularAvanceSemanal([], new Date("2027-01-01T17:00:00Z"));
  assert.equal(semana.inicio, "2026-12-28T05:00:00.000Z");
  assert.equal(semana.fin, "2027-01-04T05:00:00.000Z");
  assert.equal(calcularAvanceSemanal([], new Date("2027-01-01T17:00:00Z"), 1).inicio, semana.fin);
});

test("La semana conserva el 29 de febrero de un año bisiesto", () => {
  const semana = calcularAvanceSemanal([completada("2028-02-29T12:00:00Z")], new Date("2028-02-29T17:00:00Z"));
  assert.equal(semana.inicio, "2028-02-28T05:00:00.000Z");
  assert.equal(semana.fin, "2028-03-06T05:00:00.000Z");
  assert.equal(semana.total, 1);
});

test("Cambiar la zona del dispositivo mantiene el intervalo y el conteo", () => {
  const tareas = [completada("2026-11-23T04:59:59Z"), completada("2026-11-23T05:00:00Z")];
  const esperado = calcularAvanceSemanal(tareas, referencia);
  for (const zona of ["UTC", "Pacific/Auckland", "America/Los_Angeles", "Asia/Tokyo"]) {
    process.env.TZ = zona;
    assert.deepEqual(calcularAvanceSemanal(tareas, referencia), esperado);
  }
});

test("Recargar los datos y repetir una finalización mantiene el conteo y la fecha", async () => {
  const tarea = completada("2026-11-24T16:00:00.000Z");
  const entorno = prepararAlmacenamiento(JSON.stringify([tarea]));
  assert.equal(calcularAvanceSemanal(leerTareas().tareas, referencia).total, 1);
  assert.equal((await completarTarea(tarea.id)).estado, "guardada");
  assert.equal(calcularAvanceSemanal(leerTareas().tareas, referencia).total, 1);
  assert.equal(JSON.parse(entorno.contenido)[0].fecha_finalizacion, tarea.fecha_finalizacion);
  assert.ok(entorno.operaciones.every((op) => op.tipo === "lectura"));
});

test("El conteo conserva 200 finalizaciones distintas sin persistir un contador", () => {
  const tareas = Array.from({ length: 200 }, () => completada("2026-11-24T16:00:00Z"));
  assert.equal(calcularAvanceSemanal(tareas, referencia).total, 200);
  assert.equal(tareas.length, 200);
});
