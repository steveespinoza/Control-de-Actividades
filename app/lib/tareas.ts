export const MAX_TAREAS_EN_CURSO = 10;

export type EstadoTarea = "pendiente" | "en_curso" | "completada";

export type Tarea = {
  id: string;
  titulo: string;
  estado: EstadoTarea;
  fecha_finalizacion: string | null;
};

function esFechaUtc(valor: unknown): valor is string {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(valor)) {
    return false;
  }

  const fecha = new Date(valor);
  const normalizada = valor.includes(".") ? valor : valor.replace("Z", ".000Z");
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString() === normalizada;
}

export function esTarea(valor: unknown): valor is Tarea {
  if (typeof valor !== "object" || valor === null) return false;

  return (
    "id" in valor &&
    typeof valor.id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(valor.id) &&
    "titulo" in valor &&
    typeof valor.titulo === "string" &&
    valor.titulo.trim().length > 0 &&
    "estado" in valor &&
    (valor.estado === "pendiente" || valor.estado === "en_curso" || valor.estado === "completada") &&
    "fecha_finalizacion" in valor &&
    (valor.estado === "completada"
      ? esFechaUtc(valor.fecha_finalizacion)
      : valor.fecha_finalizacion === null)
  );
}
