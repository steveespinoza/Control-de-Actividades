import { esTarea, MAX_TAREAS_EN_CURSO, type Tarea } from "../tareas";

export const CLAVE_TAREAS = "control-de-actividades:tareas";

async function conBloqueo<T>(accion: () => T): Promise<T> {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), 2500);
  try {
    return await window.navigator.locks.request(CLAVE_TAREAS, {
      mode: "exclusive",
      signal: controlador.signal,
    }, () => {
      clearTimeout(temporizador);
      return accion();
    });
  } finally {
    clearTimeout(temporizador);
  }
}

function motivoGuardado(error: unknown): "espera" | "guardado" {
  return error instanceof Error && error.name === "AbortError" ? "espera" : "guardado";
}

export type LecturaTareas =
  | { estado: "lista"; tareas: Tarea[] }
  | { estado: "error"; motivo: "acceso" | "datos" };

export type RegistroTarea =
  | { estado: "guardada"; tareas: Tarea[] }
  | { estado: "error"; motivo: "titulo" | "acceso" | "datos" | "guardado" | "navegador" | "espera" };

export type MovimientoTarea =
  | { estado: "guardada"; tareas: Tarea[] }
  | {
      estado: "error";
      motivo: "acceso" | "datos" | "guardado" | "navegador" | "espera" | "destino" | "no_encontrada" | "completada" | "capacidad";
      tareas?: Tarea[];
    };

export type FinalizacionTarea =
  | { estado: "guardada"; tareas: Tarea[] }
  | { estado: "error"; motivo: "acceso" | "datos" | "guardado" | "navegador" | "espera" | "no_encontrada"; tareas?: Tarea[] };

export function leerTareas(): LecturaTareas {
  let contenido: string | null;

  try {
    contenido = window.localStorage.getItem(CLAVE_TAREAS);
  } catch {
    return { estado: "error", motivo: "acceso" };
  }

  if (contenido === null) return { estado: "lista", tareas: [] };

  try {
    const datos: unknown = JSON.parse(contenido);
    if (!Array.isArray(datos) || !datos.every(esTarea)) {
      return { estado: "error", motivo: "datos" };
    }

    const ids = new Set(datos.map((tarea) => tarea.id.toLowerCase()));
    if (
      ids.size !== datos.length ||
      datos.filter((tarea) => tarea.estado === "en_curso").length > MAX_TAREAS_EN_CURSO
    ) {
      return { estado: "error", motivo: "datos" };
    }

    return { estado: "lista", tareas: datos };
  } catch {
    return { estado: "error", motivo: "datos" };
  }
}

export async function registrarTarea(titulo: string): Promise<RegistroTarea> {
  if (titulo.trim().length === 0) return { estado: "error", motivo: "titulo" };

  try {
    if (!window.navigator.locks) return { estado: "error", motivo: "navegador" };

    // La lectura y la escritura comparten un bloqueo entre pestañas del mismo sitio.
    return await conBloqueo<RegistroTarea>(() => {
      const lectura = leerTareas();
      if (lectura.estado === "error") return lectura;

      const tarea: Tarea = {
        id: window.crypto.randomUUID(),
        titulo,
        estado: "pendiente",
        fecha_finalizacion: null,
      };

      if (lectura.tareas.some((existente) => existente.id.toLowerCase() === tarea.id.toLowerCase())) {
        return { estado: "error", motivo: "guardado" };
      }

      const tareas = [...lectura.tareas, tarea];
      window.localStorage.setItem(CLAVE_TAREAS, JSON.stringify(tareas));
      return { estado: "guardada", tareas };
    });
  } catch (error) {
    return { estado: "error", motivo: motivoGuardado(error) };
  }
}

export async function moverTarea(id: string, destino: "pendiente" | "en_curso"): Promise<MovimientoTarea> {
  if (destino !== "pendiente" && destino !== "en_curso") return { estado: "error", motivo: "destino" };

  try {
    if (!window.navigator.locks) return { estado: "error", motivo: "navegador" };

    return await conBloqueo<MovimientoTarea>(() => {
      const lectura = leerTareas();
      if (lectura.estado === "error") return lectura;

      const tarea = lectura.tareas.find((existente) => existente.id.toLowerCase() === id.toLowerCase());
      if (!tarea) return { estado: "error", motivo: "no_encontrada", tareas: lectura.tareas };
      if (tarea.estado === "completada") return { estado: "error", motivo: "completada", tareas: lectura.tareas };
      if (tarea.estado === destino) return { estado: "guardada", tareas: lectura.tareas };

      if (destino === "en_curso" && lectura.tareas.filter((existente) => existente.estado === "en_curso").length >= MAX_TAREAS_EN_CURSO) {
        return { estado: "error", motivo: "capacidad", tareas: lectura.tareas };
      }

      const tareas = lectura.tareas.map((existente) => existente.id === tarea.id ? { ...existente, estado: destino } : existente);
      window.localStorage.setItem(CLAVE_TAREAS, JSON.stringify(tareas));
      return { estado: "guardada", tareas };
    });
  } catch (error) {
    return { estado: "error", motivo: motivoGuardado(error) };
  }
}

export async function completarTarea(id: string): Promise<FinalizacionTarea> {
  try {
    if (!window.navigator.locks) return { estado: "error", motivo: "navegador" };

    return await conBloqueo<FinalizacionTarea>(() => {
      const lectura = leerTareas();
      if (lectura.estado === "error") return lectura;

      const tarea = lectura.tareas.find((existente) => existente.id.toLowerCase() === id.toLowerCase());
      if (!tarea) return { estado: "error", motivo: "no_encontrada", tareas: lectura.tareas };
      if (tarea.estado === "completada") return { estado: "guardada", tareas: lectura.tareas };

      const fechaFinalizacion = new Date().toISOString();
      const tareas = lectura.tareas.map((existente) => existente.id === tarea.id
        ? { ...existente, estado: "completada" as const, fecha_finalizacion: fechaFinalizacion }
        : existente);
      // Estado y fecha se confirman juntos, en una única escritura de la colección.
      window.localStorage.setItem(CLAVE_TAREAS, JSON.stringify(tareas));
      return { estado: "guardada", tareas };
    });
  } catch (error) {
    return { estado: "error", motivo: motivoGuardado(error) };
  }
}
