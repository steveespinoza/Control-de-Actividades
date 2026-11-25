import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { registrarTarea, moverTarea, completarTarea } from "./soporte/modulos-tareas.mjs";
import { prepararAlmacenamiento } from "./soporte/almacenamiento-tareas.mjs";

const descriptorWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
afterEach(() => {
  if (descriptorWindow) Object.defineProperty(globalThis, "window", descriptorWindow);
  else delete globalThis.window;
});

const pendiente = { id: "10000000-0000-4000-8000-000000000001", titulo: "Pendiente", estado: "pendiente", fecha_finalizacion: null };
const operaciones = [
  ["registro", () => registrarTarea("Nuevo pendiente")],
  ["movimiento", () => moverTarea(pendiente.id, "en_curso")],
  ["finalización", () => completarTarea(pendiente.id)],
];

for (const [nombre, operar] of operaciones) {
  test(`${nombre}: agotar la espera cancela sin escrituras tardías y permite reintentar`, async () => {
    let liberar;
    const original = JSON.stringify([pendiente]);
    const entorno = prepararAlmacenamiento(original, new Promise((resolve) => { liberar = resolve; }));
    try {
      assert.deepEqual(await operar(), { estado: "error", motivo: "espera" });
      assert.equal(entorno.bloqueos[0].opciones.signal.aborted, true);
      assert.deepEqual(entorno.operaciones, []);
      assert.equal(entorno.contenido, original);
    } finally {
      liberar();
    }
    await new Promise(setImmediate);
    assert.deepEqual(entorno.operaciones, []);
    assert.equal(entorno.contenido, original);
    assert.equal((await operar()).estado, "guardada");
    assert.equal(entorno.operaciones.filter((op) => op.tipo === "escritura").length, 1);
  });

  test(`${nombre}: obtener el bloqueo antes del plazo guarda una sola vez`, async () => {
    let liberar;
    const entorno = prepararAlmacenamiento(JSON.stringify([pendiente]), new Promise((resolve) => { liberar = resolve; }));
    const resultado = operar();
    await new Promise(setImmediate);
    assert.deepEqual(entorno.operaciones, []);
    liberar();
    assert.equal((await resultado).estado, "guardada");
    assert.equal(entorno.operaciones.filter((op) => op.tipo === "escritura").length, 1);
    assert.equal(entorno.bloqueos[0].opciones.signal.aborted, false);
  });
}
