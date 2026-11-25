import type { Tarea } from "./tareas";

const zona = "America/Lima";
const formatoCivil = new Intl.DateTimeFormat("en-CA", {
  timeZone: zona, year: "numeric", month: "2-digit", day: "2-digit",
});
const formatoVisible = new Intl.DateTimeFormat("es-PE", {
  timeZone: zona, day: "numeric", month: "long", year: "numeric",
});

export function calcularAvanceSemanal(tareas: Tarea[], referencia = new Date(), desplazamiento = 0) {
  const partes = formatoCivil.formatToParts(referencia);
  const parte = (tipo: Intl.DateTimeFormatPartTypes) => partes.find((valor) => valor.type === tipo)!.value;
  // La medianoche de Lima (UTC−05:00) corresponde a las 05:00 UTC.
  const inicio = new Date(`${parte("year")}-${parte("month")}-${parte("day")}T00:00:00-05:00`);
  inicio.setUTCDate(inicio.getUTCDate() - (inicio.getUTCDay() + 6) % 7 + desplazamiento * 7);
  const fin = new Date(inicio);
  fin.setUTCDate(fin.getUTCDate() + 7);

  const total = tareas.filter((tarea) => {
    if (tarea.estado !== "completada" || tarea.fecha_finalizacion === null) return false;
    const instante = new Date(tarea.fecha_finalizacion).getTime();
    return instante >= inicio.getTime() && instante < fin.getTime();
  }).length;

  return {
    inicio: inicio.toISOString(),
    fin: fin.toISOString(),
    intervalo: `Del ${formatoVisible.format(inicio)} al ${formatoVisible.format(new Date(fin.getTime() - 1))}`,
    total,
  };
}
