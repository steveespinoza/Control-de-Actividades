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
        const resultado = new Promise((resolve, reject) => {
          const { signal } = opciones;
          const cancelar = () => reject(new DOMException("Espera cancelada", "AbortError"));
          if (signal?.aborted) { cancelar(); return; }
          signal?.addEventListener("abort", cancelar, { once: true });
          void cola.then(async () => {
            signal?.removeEventListener("abort", cancelar);
            if (signal?.aborted) return;
            bajoBloqueo = true;
            try { resolve(await accion()); }
            catch (error) { reject(error); }
            finally { bajoBloqueo = false; }
          });
        });
        // Cancelar una solicitud en espera no libera el bloqueo que la precede.
        cola = Promise.allSettled([cola, resultado]);
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
