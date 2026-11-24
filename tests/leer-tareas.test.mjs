import assert from "node:assert/strict";
import { after, afterEach, test } from "node:test";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

// Node 20 necesita JavaScript: se transpilan los dos módulos reales fuera del repositorio.
const carpetaTemporal = mkdtempSync(path.join(tmpdir(), "control-actividades-tests-"));
after(() => {
  assert.equal(path.dirname(carpetaTemporal), path.resolve(tmpdir()));
  assert.ok(path.basename(carpetaTemporal).startsWith("control-actividades-tests-"));
  rmSync(carpetaTemporal, { recursive: true, force: true });
});

for (const archivo of ["tareas.ts", "client/tareas.ts"]) {
  const origen = path.join(fileURLToPath(new URL("../app/lib/", import.meta.url)), archivo);
  const destino = path.join(carpetaTemporal, archivo.replace(/\.ts$/, ".js"));
  const { outputText } = ts.transpileModule(readFileSync(origen, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
    fileName: origen,
  });
  mkdirSync(path.dirname(destino), { recursive: true });
  writeFileSync(destino, outputText);
}

const { default: { leerTareas, CLAVE_TAREAS } } = await import(
  pathToFileURL(path.join(carpetaTemporal, "client/tareas.js")).href
);
const descriptorWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
let operacionesNoPermitidas = [];

afterEach(() => {
  if (descriptorWindow) Object.defineProperty(globalThis, "window", descriptorWindow);
  else delete globalThis.window;

  const operaciones = operacionesNoPermitidas;
  operacionesNoPermitidas = [];
  assert.deepEqual(operaciones, [], "La consulta debe limitarse a leer: no puede modificar ni eliminar datos");
});

function impedirOperacion(operacion) {
  operacionesNoPermitidas.push(operacion);
  throw new Error("Operación no permitida en una consulta");
}

function prepararLectura(contenido) {
  const clavesLeidas = [];
  const almacenamiento = new Proxy({
    getItem(clave) {
      clavesLeidas.push(clave);
      return contenido;
    },
  }, {
    get(objeto, propiedad) {
      if (propiedad !== "getItem") return impedirOperacion(String(propiedad));
      return objeto.getItem;
    },
    set: () => impedirOperacion("asignación"),
    deleteProperty: () => impedirOperacion("eliminación"),
    defineProperty: () => impedirOperacion("definición de propiedad"),
  });

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      get localStorage() { return almacenamiento; },
      set localStorage(_valor) { impedirOperacion("reemplazo de localStorage"); },
    },
  });

  return () => {
    const lecturasAnteriores = clavesLeidas.length;
    const resultado = leerTareas();
    assert.equal(clavesLeidas.length, lecturasAnteriores + 1);
    assert.equal(clavesLeidas.at(-1), CLAVE_TAREAS);
    return resultado;
  };
}

function tarea(numero, estado = "pendiente", titulo = "Revisar pendientes") {
  return {
    id: `10000000-0000-4000-8000-${String(numero).padStart(12, "0")}`,
    titulo,
    estado,
    fecha_finalizacion: estado === "completada" ? "2026-11-24T16:00:00.000Z" : null,
  };
}

test("01. Una clave ausente devuelve una colección vacía", () => {
  assert.deepEqual(prepararLectura(null)(), { estado: "lista", tareas: [] });
});

test("02. Un arreglo vacío devuelve una colección vacía", () => {
  assert.deepEqual(prepararLectura("[]")(), { estado: "lista", tareas: [] });
});

test("03. La consulta conserva títulos, identificadores, estados y fechas de los tres estados", () => {
  const tareas = [tarea(1), tarea(2, "en_curso"), {
    ...tarea(3, "completada"), fecha_finalizacion: "2026-11-24T16:00:00Z",
  }];
  assert.deepEqual(prepararLectura(JSON.stringify(tareas))(), { estado: "lista", tareas });
});

test("04. Leer dos veces los mismos datos conserva el resultado", () => {
  const tareas = [tarea(1), tarea(2, "en_curso"), tarea(3, "completada")];
  const consultar = prepararLectura(JSON.stringify(tareas));
  assert.deepEqual(consultar(), { estado: "lista", tareas });
  assert.deepEqual(consultar(), { estado: "lista", tareas });
});

const casosInvalidos = [
  ["05. El contenido vacío se comunica como error", ""],
  ["06. Un valor JSON null se comunica como error", "null"],
  ["07. Un objeto en lugar de un arreglo se comunica como error", "{}"],
  ["08. El JSON incompleto se comunica como error", "{"],
  ["09. Un registro null dentro del arreglo se comunica como error", "[null]"],
  ["10. Los identificadores duplicados se comunican como error", JSON.stringify([tarea(1), tarea(1)])],
  ["11. Un identificador inválido se comunica como error", JSON.stringify([{ ...tarea(1), id: "invalido" }])],
  ["12. Un título compuesto solo por espacios se comunica como error", JSON.stringify([{ ...tarea(1), titulo: "  \n " }])],
  ["13. Un estado desconocido se comunica como error", JSON.stringify([{ ...tarea(1), estado: "otro" }])],
  ["14. Una tarea pendiente con fecha de finalización se comunica como error", JSON.stringify([{ ...tarea(1), fecha_finalizacion: "2026-11-24T16:00:00.000Z" }])],
  ["15. Una tarea completada sin fecha se comunica como error", JSON.stringify([{ ...tarea(1, "completada"), fecha_finalizacion: null }])],
  ["16. Una fecha imposible se comunica como error", JSON.stringify([{ ...tarea(1, "completada"), fecha_finalizacion: "2026-02-30T00:00:00.000Z" }])],
  ["17. Una colección con once tareas en curso se comunica como error", JSON.stringify(Array.from({ length: 11 }, (_, i) => tarea(i, "en_curso")))],
];

for (const [nombre, contenido] of casosInvalidos) {
  test(nombre, () => {
    assert.deepEqual(prepararLectura(contenido)(), { estado: "error", motivo: "datos" });
  });
}

test("18. Una colección con diez tareas en curso se consulta correctamente", () => {
  const tareas = Array.from({ length: 10 }, (_, i) => tarea(i, "en_curso"));
  assert.deepEqual(prepararLectura(JSON.stringify(tareas))(), { estado: "lista", tareas });
});

test("19. La consulta conserva 200 tareas, incluidas fechas, etiquetas como texto y títulos largos", () => {
  const tareas = Array.from({ length: 200 }, (_, i) => tarea(
    i,
    i < 10 ? "en_curso" : i < 100 ? "pendiente" : "completada",
    i === 199 ? `<img src=x onerror=alert(1)> ${"TituloLargo".repeat(50)}` : `Tarea ${i}`,
  ));
  assert.deepEqual(prepararLectura(JSON.stringify(tareas))(), { estado: "lista", tareas });
});

test("20. El acceso bloqueado a localStorage se comunica como error de acceso", () => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { get localStorage() { throw new Error("SecurityError"); } },
  });
  assert.deepEqual(leerTareas(), { estado: "error", motivo: "acceso" });
});
