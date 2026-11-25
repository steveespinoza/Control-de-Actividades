"use client";

import { useEffect, useRef, useState } from "react";
import FormularioTarea from "./formulario-tarea";
import { completarTarea, leerTareas, moverTarea, type LecturaTareas } from "../lib/client/tareas";
import { MAX_TAREAS_EN_CURSO, type EstadoTarea } from "../lib/tareas";

const columnas: {
  estado: EstadoTarea;
  titulo: string;
  vacio: string;
  headingClassName: string;
  countClassName: string;
}[] = [
  {
    estado: "pendiente",
    titulo: "Pendiente",
    vacio: "No hay tareas pendientes.",
    headingClassName: "border-slate-300 text-slate-700",
    countClassName: "bg-slate-200 text-slate-800",
  },
  {
    estado: "en_curso",
    titulo: "En curso",
    vacio: "No hay tareas en curso.",
    headingClassName: "border-neutral-950 text-neutral-950",
    countClassName: "bg-neutral-950 text-white",
  },
  {
    estado: "completada",
    titulo: "Completadas",
    vacio: "Aún no hay tareas completadas.",
    headingClassName: "border-emerald-600 text-emerald-800",
    countClassName: "bg-emerald-100 text-emerald-800",
  },
];

const erroresMovimiento = {
  acceso: "No se pudieron leer las tareas. Comprueba que el navegador permita el almacenamiento local y vuelve a intentarlo.",
  datos: "Los datos guardados no tienen un formato válido. No se ha guardado el cambio.",
  guardado: "No se pudo guardar el cambio. La tarea conserva su estado anterior. Vuelve a intentarlo.",
  espera: "Otra pestaña está usando tus tareas y se agotó el tiempo de espera. No se guardó el cambio. Vuelve a intentarlo.",
  navegador: "Este navegador no permite guardar cambios de forma segura. Prueba con una versión actualizada.",
  destino: "El destino solicitado no está disponible para este movimiento.",
  no_encontrada: "La tarea ya no está en los datos guardados. Se ha actualizado el tablero.",
  completada: "La tarea ya está completada y no puede volver a Pendiente ni a En curso.",
  capacidad: `En curso ya tiene ${MAX_TAREAS_EN_CURSO} tareas. Devuelve una a Pendiente o complétala antes de ingresar otra.`,
};

export default function Tablero() {
  const [consulta, setConsulta] = useState<LecturaTareas | { estado: "cargando" }>({ estado: "cargando" });
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [registroConfirmado, setRegistroConfirmado] = useState(false);
  const [columnaMovil, setColumnaMovil] = useState<EstadoTarea>("pendiente");
  const botonNuevaTarea = useRef<HTMLButtonElement>(null);
  const devolverFoco = useRef(false);
  const [movimientoActual, setMovimientoActual] = useState<{ id: string; destino: EstadoTarea } | null>(null);
  const idMoviendo = movimientoActual?.id ?? null;
  const movimientoEnCurso = useRef(false);
  const focoTarea = useRef<string | null>(null);
  const [mensajeMovimiento, setMensajeMovimiento] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);

  async function mover(id: string, destino: EstadoTarea) {
    if (movimientoEnCurso.current || formularioVisible) return;
    movimientoEnCurso.current = true;
    setMovimientoActual({ id, destino });
    setRegistroConfirmado(false);
    setMensajeMovimiento(null);

    const resultado = destino === "completada" ? await completarTarea(id) : await moverTarea(id, destino);
    focoTarea.current = id;
    if (resultado.tareas) setConsulta({ estado: "lista", tareas: resultado.tareas });
    if (resultado.estado === "guardada") {
      setColumnaMovil(destino);
    }
    setMensajeMovimiento(
      resultado.estado === "guardada"
        ? {
            tipo: "exito",
            texto:
              destino === "completada"
                ? "Tarea completada. Cierre definitivo guardado."
                : `Tarea en ${destino === "en_curso" ? "En curso" : "Pendiente"}. Cambio confirmado.`,
          }
        : { tipo: "error", texto: erroresMovimiento[resultado.motivo] },
    );
    movimientoEnCurso.current = false;
    setMovimientoActual(null);
  }

  useEffect(() => {
    if (focoTarea.current && !idMoviendo) {
      const accion = document.getElementById(`mover-${focoTarea.current}`);
      (accion ?? document.getElementById(`tarea-${focoTarea.current}`) ?? document.getElementById("contenido"))?.focus();
      focoTarea.current = null;
    }
  }, [consulta, idMoviendo, columnaMovil]);

  function cerrarFormulario() {
    devolverFoco.current = true;
    setFormularioVisible(false);
  }

  useEffect(() => {
    if (!formularioVisible && devolverFoco.current) {
      botonNuevaTarea.current?.focus();
      devolverFoco.current = false;
    }
  }, [formularioVisible]);

  useEffect(() => {
    let activo = true;
    // La lectura comienza después de hidratar: el servidor no accede al navegador.
    void Promise.resolve().then(() => {
      if (activo) setConsulta(leerTareas());
    });
    return () => {
      activo = false;
    };
  }, []);

  const totalEnCurso =
    consulta.estado === "lista"
      ? consulta.tareas.filter((tarea) => tarea.estado === "en_curso").length
      : 0;

  const cabecera = (
    <header className="erp-card erp-card-accent mb-7 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="erp-kicker">Panel principal</p>
          <h1 className="mt-1.5 text-2xl font-extrabold text-neutral-950 sm:text-3xl">
            Mi tablero
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Tus tareas, en un solo lugar.{" "}
            <span className="font-semibold text-neutral-900">Datos en este navegador</span>
            {consulta.estado === "lista" && (
              <>
                {" "}
                | En curso:{" "}
                <span className="erp-mono-number text-neutral-950">
                  {totalEnCurso}/{MAX_TAREAS_EN_CURSO}
                </span>
              </>
            )}
          </p>
        </div>

        <button
          ref={botonNuevaTarea}
          type="button"
          aria-expanded={formularioVisible}
          aria-controls={formularioVisible ? "formulario-tarea" : undefined}
          disabled={consulta.estado !== "lista" || formularioVisible || idMoviendo !== null}
          onClick={() => {
            setRegistroConfirmado(false);
            setMensajeMovimiento(null);
            setFormularioVisible(true);
          }}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-neutral-950 px-5 py-2.5 text-sm font-bold text-white enabled:hover:bg-black disabled:cursor-default disabled:bg-neutral-300 disabled:text-neutral-600"
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nueva tarea
        </button>
      </div>
    </header>
  );

  if (consulta.estado === "cargando") {
    return (
      <div>
        {cabecera}
        <div
          role="status"
          className="erp-card px-6 py-12 text-center text-sm font-medium text-slate-600"
        >
          Cargando tus tareas…
        </div>
      </div>
    );
  }

  if (consulta.estado === "error") {
    return (
      <div>
        {cabecera}
        <section
          role="alert"
          className="rounded border border-red-200 bg-red-50 p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold text-red-800">No pudimos cargar tus tareas</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-red-700">
            {consulta.motivo === "datos"
              ? "Los datos guardados no tienen un formato válido. No se pueden mostrar las tareas."
              : "No se pueden leer los datos de este sitio. Comprueba que tu navegador permita el almacenamiento local y vuelve a intentarlo."}
          </p>
          <button
            type="button"
            onClick={() => setConsulta(leerTareas())}
            className="mt-5 min-h-11 bg-neutral-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-black"
          >
            Volver a intentar
          </button>
        </section>
      </div>
    );
  }

  return (
    <div>
      {cabecera}

      {formularioVisible && (
        <FormularioTarea
          onCancelar={cerrarFormulario}
          onGuardada={(tareas) => {
            setConsulta({ estado: "lista", tareas });
            setColumnaMovil("pendiente");
            setRegistroConfirmado(true);
            cerrarFormulario();
          }}
        />
      )}

      <div role="status" aria-atomic="true">
        {registroConfirmado && (
          <p className="mb-4 border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-950 shadow-xs">
            Tarea registrada en Pendiente.
          </p>
        )}
        {idMoviendo && (
          <p className="mb-4 text-sm font-semibold text-slate-600">
            {movimientoActual?.destino === "completada"
              ? "Completando tarea…"
              : "Guardando movimiento…"}
          </p>
        )}
        {mensajeMovimiento?.tipo === "exito" && (
          <p className="mb-4 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            {mensajeMovimiento.texto}
          </p>
        )}
      </div>

      <p
        role="alert"
        aria-atomic="true"
        className={
          mensajeMovimiento?.tipo === "error"
            ? "mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
            : undefined
        }
      >
        {mensajeMovimiento?.tipo === "error" ? mensajeMovimiento.texto : ""}
      </p>

      {consulta.tareas.length === 0 && (
        <div role="status" className="erp-card mb-6 px-5 py-4">
          <p className="text-sm font-bold text-neutral-950">Tu tablero está vacío</p>
          <p className="mt-1 text-sm text-slate-600">
            Registra tu primera tarea para empezar.
          </p>
        </div>
      )}

      <section aria-labelledby="titulo-gestion-operativa">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="erp-kicker">Gestión operativa</p>
            <h2
              id="titulo-gestion-operativa"
              className="mt-1 text-xl font-extrabold text-neutral-950"
            >
              Actividades
            </h2>
          </div>
          <p className="text-xs font-medium text-slate-600">
            Máximo {MAX_TAREAS_EN_CURSO} tareas simultáneas en curso · Cierre definitivo al completar
          </p>
        </div>

        <nav
          aria-label="Estados de las tareas"
          className="mb-4 grid grid-cols-3 gap-1 rounded border-2 border-slate-200 bg-slate-200/70 p-1 md:hidden"
        >
          {columnas.map((columna) => {
            const cantidad = consulta.tareas.filter((t) => t.estado === columna.estado).length;
            const activa = columnaMovil === columna.estado;
            return (
              <button
                key={columna.estado}
                type="button"
                aria-pressed={activa}
                aria-controls={`seccion-columna-${columna.estado}`}
                onClick={() => setColumnaMovil(columna.estado)}
                className={`flex min-h-11 min-w-0 flex-col items-center justify-center rounded px-2 py-2 text-xs font-extrabold uppercase transition-colors ${
                  activa
                    ? "bg-white text-neutral-950 shadow-xs"
                    : "text-slate-600 hover:bg-white/70 hover:text-neutral-950"
                }`}
              >
                <span className="truncate">{columna.titulo}</span>
                <span
                  className={`erp-mono-number mt-1 rounded px-1.5 py-0.5 text-[11px] ${
                    activa ? columna.countClassName : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {cantidad}
                  {columna.estado === "en_curso" && `/${MAX_TAREAS_EN_CURSO}`}
                </span>
              </button>
            );
          })}
        </nav>

        <div
          className="grid grid-cols-1 items-start gap-5 md:grid-cols-3"
          aria-label="Tareas por estado"
        >
          {columnas.map((columna) => {
            const tareasColumna = consulta.tareas.filter(
              (tarea) => tarea.estado === columna.estado,
            );
            const visibleEnMovil = columnaMovil === columna.estado;

            return (
              <section
                key={columna.estado}
                id={`seccion-columna-${columna.estado}`}
                data-estado={columna.estado}
                aria-labelledby={`columna-${columna.estado}`}
                className={`columna-tareas min-w-0 flex-col gap-3 rounded border-2 border-slate-200/80 bg-slate-100/70 p-3.5 ${
                  visibleEnMovil ? "flex" : "hidden md:flex"
                }`}
              >
                <header
                  className={`flex items-center justify-between gap-3 border-b-2 pb-2.5 ${columna.headingClassName}`}
                >
                  <h2
                    id={`columna-${columna.estado}`}
                    className="text-xs font-extrabold uppercase tracking-wider text-inherit"
                  >
                    {columna.titulo}
                  </h2>
                  <span
                    className={`erp-mono-number shrink-0 rounded px-2 py-0.5 text-xs ${columna.countClassName}`}
                    aria-label={
                      columna.estado === "en_curso"
                        ? `${tareasColumna.length} de ${MAX_TAREAS_EN_CURSO} tareas en curso`
                        : `${tareasColumna.length} tareas`
                    }
                  >
                    {tareasColumna.length}
                    {columna.estado === "en_curso" && ` / ${MAX_TAREAS_EN_CURSO}`}
                  </span>
                </header>

                {tareasColumna.length === 0 ? (
                  <p className="flex min-h-36 items-center justify-center rounded border-2 border-dashed border-slate-300 bg-white/70 px-4 py-6 text-center text-sm text-slate-600">
                    {columna.vacio}
                  </p>
                ) : (
                  <ul
                    tabIndex={0}
                    aria-label={`Tareas en ${columna.titulo}`}
                    className="space-y-3 overflow-y-auto overscroll-contain p-0.5 md:max-h-[calc(100dvh-18rem)]"
                  >
                    {tareasColumna.map((tarea) => (
                      <li
                        key={tarea.id}
                        id={`tarea-${tarea.id}`}
                        tabIndex={-1}
                        aria-busy={idMoviendo === tarea.id}
                        className="erp-interactive-card p-4"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span
                            className={`rounded border px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${
                              tarea.estado === "completada"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : tarea.estado === "en_curso"
                                  ? "border-neutral-900 bg-neutral-950 text-white"
                                  : "border-slate-300 bg-slate-100 text-slate-700"
                            }`}
                          >
                            {columna.titulo}
                          </span>
                        </div>

                        <p className="text-sm font-semibold leading-6 text-neutral-950 whitespace-pre-wrap [overflow-wrap:anywhere]">
                          {tarea.titulo}
                        </p>

                        {tarea.estado !== "completada" ? (
                          <div className="mt-4 flex flex-wrap gap-2 border-t-2 border-slate-100 pt-3">
                            <button
                              id={`mover-${tarea.id}`}
                              type="button"
                              disabled={idMoviendo !== null || formularioVisible}
                              aria-label={`${tarea.estado === "pendiente" ? "Pasar a En curso" : "Volver a Pendiente"}: ${tarea.titulo}`}
                              onClick={() =>
                                mover(
                                  tarea.id,
                                  tarea.estado === "pendiente" ? "en_curso" : "pendiente",
                                )
                              }
                              className="min-h-11 rounded border border-neutral-900 bg-neutral-950 px-3 py-2 text-xs font-bold text-white enabled:hover:bg-black disabled:cursor-wait disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-600"
                            >
                              {idMoviendo === tarea.id && movimientoActual?.destino !== "completada"
                                ? "Guardando…"
                                : tarea.estado === "pendiente"
                                  ? "Pasar a En curso"
                                  : "Volver a Pendiente"}
                            </button>

                            <button
                              type="button"
                              disabled={idMoviendo !== null || formularioVisible}
                              aria-label={`Completar tarea: ${tarea.titulo}`}
                              onClick={() => mover(tarea.id, "completada")}
                              className="min-h-11 rounded border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-neutral-900 enabled:hover:border-neutral-950 enabled:hover:bg-neutral-100 disabled:cursor-wait disabled:bg-slate-100 disabled:text-slate-600"
                            >
                              {idMoviendo === tarea.id && movimientoActual?.destino === "completada"
                                ? "Completando…"
                                : "Completar tarea"}
                            </button>
                          </div>
                        ) : (
                          <p className="mt-3 flex items-center gap-2 border-t-2 border-slate-100 pt-3 text-xs font-bold text-emerald-800">
                            <svg
                              aria-hidden="true"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              className="shrink-0 text-emerald-600"
                            >
                              <path d="m5 12 4 4L19 6" />
                            </svg>
                            Tarea cerrada
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}
