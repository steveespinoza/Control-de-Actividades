import { esTarea, MAX_TAREAS_EN_CURSO, type Tarea } from "../tareas";

export const CLAVE_TAREAS = "control-de-actividades:tareas";

export type LecturaTareas =
  | { estado: "lista"; tareas: Tarea[] }
  | { estado: "error"; motivo: "acceso" | "datos" };

export type RegistroTarea =
  | { estado: "guardada"; tareas: Tarea[] }
  | { estado: "error"; motivo: "titulo" | "acceso" | "datos" | "guardado" | "navegador" };

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
    return await window.navigator.locks.request(CLAVE_TAREAS, { mode: "exclusive" }, () => {
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
  } catch {
    return { estado: "error", motivo: "guardado" };
  }
}
