"use client";

import { useEffect, useRef, useState } from "react";
import { calcularAvanceSemanal } from "../lib/avance-semanal";
import { leerTareas } from "../lib/client/tareas";

type ConsultaAvance =
  | { estado: "cargando" }
  | { estado: "error"; motivo: "acceso" | "datos" }
  | { estado: "lista"; avance: ReturnType<typeof calcularAvanceSemanal> };

export default function AvanceSemanal() {
  const [semana, setSemana] = useState(0);
  const [revision, setRevision] = useState(0);
  const [consulta, setConsulta] = useState<ConsultaAvance>({ estado: "cargando" });
  const tituloAvance = useRef<HTMLHeadingElement>(null);
  const enfocarTrasReintento = useRef(false);

  useEffect(() => {
    let activo = true;
    void Promise.resolve().then(() => {
      if (!activo) return;
      const lectura = leerTareas();
      setConsulta(
        lectura.estado === "error"
          ? lectura
          : {
              estado: "lista",
              avance: calcularAvanceSemanal(lectura.tareas, new Date(), semana),
            },
      );
    });
    return () => {
      activo = false;
    };
  }, [semana, revision]);

  useEffect(() => {
    if (consulta.estado !== "cargando" && enfocarTrasReintento.current) {
      tituloAvance.current?.focus();
      enfocarTrasReintento.current = false;
    }
  }, [consulta]);

  function consultar(destino: number) {
    setConsulta({ estado: "cargando" });
    setSemana(destino);
    setRevision((valor) => valor + 1);
  }

  const estiloBoton =
    "min-h-11 border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-neutral-900 enabled:hover:border-neutral-950 enabled:hover:bg-neutral-100 disabled:cursor-wait disabled:bg-slate-100 disabled:text-slate-600";

  return (
    <section
      id="avance-semanal"
      tabIndex={-1}
      aria-labelledby="titulo-avance"
      aria-busy={consulta.estado === "cargando"}
      className="erp-card erp-card-accent p-5 sm:p-6"
    >
      <div className="flex flex-col gap-4 border-b-2 border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="erp-kicker">Seguimiento</p>
          <h1
            ref={tituloAvance}
            id="titulo-avance"
            tabIndex={-1}
            className="mt-1 text-2xl font-extrabold text-neutral-950 sm:text-3xl"
          >
            Avance semanal
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Semanas de lunes a domingo, en hora de Lima (Perú).
          </p>
        </div>

        <nav aria-label="Semanas del avance" className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={consulta.estado === "cargando"}
            onClick={() => consultar(semana - 1)}
            className={estiloBoton}
          >
            Semana anterior
          </button>
          <button
            type="button"
            disabled={consulta.estado === "cargando"}
            onClick={() => consultar(0)}
            className={
              semana === 0
                ? "min-h-11 border border-neutral-950 bg-neutral-950 px-3.5 py-2 text-xs font-bold text-white enabled:hover:bg-black disabled:cursor-wait disabled:bg-neutral-300 disabled:text-neutral-600"
                : estiloBoton
            }
          >
            Semana actual
          </button>
          <button
            type="button"
            disabled={consulta.estado === "cargando"}
            onClick={() => consultar(semana + 1)}
            className={estiloBoton}
          >
            Semana siguiente
          </button>
        </nav>
      </div>

      <div
        role="status"
        aria-atomic="true"
        className={consulta.estado !== "error" ? "mt-5" : undefined}
      >
        {consulta.estado === "cargando" && (
          <p className="text-sm font-medium text-slate-600">
            Consultando avance semanal…
          </p>
        )}
        {consulta.estado === "lista" && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
            <div className="flex items-baseline gap-3">
              <span className="erp-mono-number text-4xl leading-none text-neutral-950">
                {consulta.avance.total}
              </span>
              <span className="text-sm font-bold text-slate-700">
                {consulta.avance.total === 1 ? "tarea completada" : "tareas completadas"}
              </span>
            </div>
            <p className="rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
              {consulta.avance.intervalo}
            </p>
          </div>
        )}
      </div>

      {consulta.estado === "error" && (
        <div
          role="alert"
          className="mt-4 border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
        >
          <p>
            {consulta.motivo === "datos"
              ? "Los datos guardados no tienen un formato válido. No se pudo consultar el avance semanal."
              : "No se pueden leer tus tareas. Comprueba que el navegador permita el almacenamiento local y vuelve a intentarlo."}
          </p>
          <button
            type="button"
            onClick={() => {
              enfocarTrasReintento.current = true;
              consultar(semana);
            }}
            className="mt-3 min-h-11 bg-neutral-950 px-4 py-2 text-xs font-bold text-white hover:bg-black"
          >
            Volver a intentar
          </button>
        </div>
      )}
    </section>
  );
}
