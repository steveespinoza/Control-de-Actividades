import assert from "node:assert/strict";
import { after } from "node:test";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

// Node 20 necesita JavaScript: se transpilan los módulos reales fuera del repositorio.
const carpetaTemporal = mkdtempSync(path.join(tmpdir(), "control-actividades-tests-"));
after(() => {
  assert.equal(path.dirname(carpetaTemporal), path.resolve(tmpdir()));
  assert.ok(path.basename(carpetaTemporal).startsWith("control-actividades-tests-"));
  rmSync(carpetaTemporal, { recursive: true, force: true });
});

for (const archivo of ["tareas.ts", "client/tareas.ts"]) {
  const origen = path.join(fileURLToPath(new URL("../../app/lib/", import.meta.url)), archivo);
  const destino = path.join(carpetaTemporal, archivo.replace(/\.ts$/, ".js"));
  const { outputText } = ts.transpileModule(readFileSync(origen, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
    fileName: origen,
  });
  mkdirSync(path.dirname(destino), { recursive: true });
  writeFileSync(destino, outputText);
}

const { default: modulo } = await import(pathToFileURL(path.join(carpetaTemporal, "client/tareas.js")).href);
export const { leerTareas, registrarTarea, moverTarea, CLAVE_TAREAS } = modulo;
