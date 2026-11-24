import { esTarea, MAX_TAREAS_EN_CURSO, type Tarea } from "../tareas";

export const CLAVE_TAREAS = "control-de-actividades:tareas";

export type LecturaTareas =
  | { estado: "lista"; tareas: Tarea[] }
  | { estado: "error"; motivo: "acceso" | "datos" };

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
