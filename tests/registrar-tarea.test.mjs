import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { randomUUID } from "node:crypto";
import { registrarTarea, CLAVE_TAREAS } from "./soporte/modulos-tareas.mjs";

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

function preparar(contenido = null, espera = Promise.resolve()) {
  let cola = espera;
  let bajoBloqueo = false;
  entorno = { contenido, operaciones: [], bloqueos: [], falloLectura: false, falloEscritura: false, falloBloqueo: false };
  const navegador = {
    locks: {
      request(nombre, opciones, accion) {
        entorno.bloqueos.push({ nombre, opciones });
        if (entorno.falloBloqueo) return Promise.reject(new Error("Bloqueo rechazado"));
        const resultado = cola.then(async () => {
          bajoBloqueo = true;
          try { return await accion(); }
          finally { bajoBloqueo = false; }
        });
        cola = resultado.catch(() => {});
        return resultado;
      },
    },
  };
  const criptografia = { randomUUID };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      navigator: navegador,
      crypto: criptografia,
      localStorage: {
        getItem(clave) {
          assert.equal(clave, CLAVE_TAREAS);
          entorno.operaciones.push({ tipo: "lectura", bajoBloqueo });
          if (entorno.falloLectura) throw new Error("SecurityError");
          return entorno.contenido;
        },
        setItem(clave, valor) {
          assert.equal(clave, CLAVE_TAREAS);
          entorno.operaciones.push({ tipo: "escritura", bajoBloqueo });
          if (entorno.falloEscritura) throw new Error("QuotaExceededError");
          entorno.contenido = valor;
        },
      },
    },
  });
  return { navegador, criptografia };
}

function tarea(estado = "pendiente") {
  return { id: randomUUID(), titulo: "Tarea existente", estado, fecha_finalizacion: estado === "completada" ? "2026-11-24T16:00:00.000Z" : null };
}

test("01. El título vacío se rechaza sin acceder al almacenamiento", async () => {
  preparar();
  assert.deepEqual(await registrarTarea(""), { estado: "error", motivo: "titulo" });
  assert.deepEqual(entorno.operaciones, []);
});

test("02. Un título compuesto por espacios se rechaza sin acceder al almacenamiento", async () => {
  preparar();
  assert.deepEqual(await registrarTarea(" \n\t "), { estado: "error", motivo: "titulo" });
  assert.deepEqual(entorno.operaciones, []);
});

test("03. La primera tarea se guarda en Pendiente con UUID y sin fecha de finalización", async () => {
  preparar();
  const resultado = await registrarTarea("  Preparar revisión  ");
  assert.equal(resultado.estado, "guardada");
  const guardadas = JSON.parse(entorno.contenido);
  assert.deepEqual(resultado.tareas, guardadas);
  assert.equal(guardadas.length, 1);
  assert.match(guardadas[0].id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.deepEqual(guardadas[0], { id: guardadas[0].id, titulo: "  Preparar revisión  ", estado: "pendiente", fecha_finalizacion: null });
});

test("04. Crear conserva las tareas existentes de los tres estados y sus fechas", async () => {
  const anteriores = [tarea(), tarea("en_curso"), tarea("completada")];
  preparar(JSON.stringify(anteriores));
  const resultado = await registrarTarea("Nuevo pendiente");
  assert.equal(resultado.estado, "guardada");
  assert.deepEqual(JSON.parse(entorno.contenido).slice(0, 3), anteriores);
  assert.equal(resultado.tareas.length, 4);
});

test("05. Tener diez tareas en curso permite crear otro pendiente", async () => {
  preparar(JSON.stringify(Array.from({ length: 10 }, () => tarea("en_curso"))));
  const resultado = await registrarTarea("Siguiente pendiente");
  assert.equal(resultado.estado, "guardada");
  assert.equal(resultado.tareas.length, 11);
  assert.equal(resultado.tareas.filter((t) => t.estado === "en_curso").length, 10);
  assert.equal(resultado.tareas.at(-1).estado, "pendiente");
});

test("06. Un fallo de escritura no confirma éxito ni altera lo guardado", async () => {
  const contenido = JSON.stringify([tarea()]);
  preparar(contenido);
  entorno.falloEscritura = true;
  assert.deepEqual(await registrarTarea("Intento fallido"), { estado: "error", motivo: "guardado" });
  assert.equal(entorno.contenido, contenido);
});

test("07. Un fallo de lectura impide escribir", async () => {
  preparar(); entorno.falloLectura = true;
  assert.deepEqual(await registrarTarea("Pendiente"), { estado: "error", motivo: "acceso" });
  assert.ok(entorno.operaciones.every((op) => op.tipo === "lectura"));
});

test("08. El JSON dañado se conserva sin sobrescribirlo", async () => {
  preparar("{");
  assert.deepEqual(await registrarTarea("Pendiente"), { estado: "error", motivo: "datos" });
  assert.equal(entorno.contenido, "{");
  assert.ok(entorno.operaciones.every((op) => op.tipo === "lectura"));
});

test("09. Una colección con identificadores duplicados impide escribir", async () => {
  const existente = tarea(); const contenido = JSON.stringify([existente, existente]);
  preparar(contenido);
  assert.deepEqual(await registrarTarea("Pendiente"), { estado: "error", motivo: "datos" });
  assert.equal(entorno.contenido, contenido);
  assert.ok(entorno.operaciones.every((op) => op.tipo === "lectura"));
});

test("10. Un identificador generado que ya existe impide escribir", async () => {
  const existente = tarea(); const contenido = JSON.stringify([existente]);
  const { criptografia } = preparar(contenido);
  criptografia.randomUUID = () => existente.id;
  assert.deepEqual(await registrarTarea("Pendiente"), { estado: "error", motivo: "guardado" });
  assert.equal(entorno.contenido, contenido);
});

test("11. Sin Web Locks se informa el problema sin leer ni escribir", async () => {
  const { navegador } = preparar(); delete navegador.locks;
  assert.deepEqual(await registrarTarea("Pendiente"), { estado: "error", motivo: "navegador" });
  assert.deepEqual(entorno.operaciones, []);
});

test("12. El rechazo del bloqueo no confirma un guardado", async () => {
  preparar(); entorno.falloBloqueo = true;
  assert.deepEqual(await registrarTarea("Pendiente"), { estado: "error", motivo: "guardado" });
  assert.deepEqual(entorno.operaciones, []);
});

test("13. Espera el bloqueo y lee los datos vigentes antes de guardar", async () => {
  let liberar;
  preparar(null, new Promise((resolve) => { liberar = resolve; }));
  let terminado = false;
  const registro = registrarTarea("Nueva tarea").then((resultado) => { terminado = true; return resultado; });
  await new Promise(setImmediate);
  assert.equal(terminado, false);
  assert.deepEqual(entorno.operaciones, []);
  const anterior = tarea(); entorno.contenido = JSON.stringify([anterior]);
  liberar();
  const resultado = await registro;
  assert.equal(resultado.estado, "guardada");
  assert.deepEqual(resultado.tareas[0], anterior);
  assert.equal(resultado.tareas.length, 2);
});

test("14. Dos creaciones encoladas conservan ambos pendientes con identificadores distintos", async () => {
  let liberar;
  preparar(null, new Promise((resolve) => { liberar = resolve; }));
  const primera = registrarTarea("Primera"); const segunda = registrarTarea("Segunda");
  assert.equal(entorno.bloqueos.length, 2);
  assert.deepEqual(entorno.operaciones, []);
  liberar();
  const resultados = await Promise.all([primera, segunda]);
  assert.ok(resultados.every((r) => r.estado === "guardada"));
  const guardadas = JSON.parse(entorno.contenido);
  assert.deepEqual(guardadas.map((t) => t.titulo), ["Primera", "Segunda"]);
  assert.equal(new Set(guardadas.map((t) => t.id)).size, 2);
});

test("15. Reintentar tras un fallo de escritura crea una sola tarea", async () => {
  preparar(); entorno.falloEscritura = true;
  assert.equal((await registrarTarea("Reintento")).estado, "error");
  entorno.falloEscritura = false;
  assert.equal((await registrarTarea("Reintento")).estado, "guardada");
  assert.equal(JSON.parse(entorno.contenido).length, 1);
});

test("16. El título largo con etiquetas se guarda sin alterarlo", async () => {
  preparar(); const titulo = `<img src=x onerror=alert(1)> ${"Pendiente".repeat(100)}`;
  const resultado = await registrarTarea(titulo);
  assert.equal(resultado.estado, "guardada");
  assert.equal(JSON.parse(entorno.contenido)[0].titulo, titulo);
});

test("17. Doscientas tareas no son un límite de creación", async () => {
  preparar(JSON.stringify(Array.from({ length: 200 }, () => tarea())));
  const resultado = await registrarTarea("Pendiente 201");
  assert.equal(resultado.estado, "guardada"); assert.equal(resultado.tareas.length, 201);
});

test("18. Un fallo al generar el identificador no modifica el almacenamiento", async () => {
  const { criptografia } = preparar();
  criptografia.randomUUID = () => { throw new Error("Generación no disponible"); };
  assert.deepEqual(await registrarTarea("Pendiente"), { estado: "error", motivo: "guardado" });
  assert.equal(entorno.contenido, null);
});
