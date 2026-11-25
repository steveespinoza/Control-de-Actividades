import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { CLAVE_TAREAS } from "./modulos-tareas.mjs";

export function prepararAlmacenamiento(contenido = null, espera = Promise.resolve()) {
  let cola = espera;
  let bajoBloqueo = false;
  const entorno = { contenido, operaciones: [], bloqueos: [], falloLectura: false, falloEscritura: false, falloBloqueo: false };
  entorno.navegador = {
    locks: {
      request(nombre, opciones, accion) {
        entorno.bloqueos.push({ nombre, opciones });
        if (entorno.falloBloqueo) return Promise.reject(new Error("Bloqueo rechazado"));
        const resultado = cola.then(async () => {
          bajoBloqueo = true;
          try { return await accion(); }
          finally { bajoBloqueo = false; }
        });
        // La cola acepta la siguiente solicitud aunque la anterior falle.
        cola = resultado.catch(() => {});
        return resultado;
      },
    },
  };
  entorno.criptografia = { randomUUID };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      navigator: entorno.navegador,
      crypto: entorno.criptografia,
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
  return entorno;
}
