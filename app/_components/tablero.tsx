"use client";

import { useEffect, useRef, useState } from "react";
import FormularioTarea from "./formulario-tarea";
import { leerTareas, moverTarea, type LecturaTareas } from "../lib/client/tareas";
import { MAX_TAREAS_EN_CURSO, type EstadoTarea } from "../lib/tareas";

const columnas: { estado: EstadoTarea; titulo: string; vacio: string }[] = [
  { estado: "pendiente", titulo: "Pendiente", vacio: "No hay tareas pendientes." },
  { estado: "en_curso", titulo: "En curso", vacio: "No hay tareas en curso." },
  { estado: "completada", titulo: "Completadas", vacio: "Aún no hay tareas completadas." },
];

const erroresMovimiento = {
  acceso: "No se pudieron leer las tareas. Comprueba que el navegador permita el almacenamiento local y vuelve a intentarlo.",
  datos: "Los datos guardados no tienen un formato válido. No se ha movido la tarea.",
  guardado: "No se pudo guardar el movimiento. La tarea no se ha movido. Vuelve a intentarlo.",
  navegador: "Este navegador no permite guardar cambios de forma segura. Prueba con una versión actualizada.",
  destino: "El destino solicitado no está disponible para este movimiento.",
  no_encontrada: "La tarea ya no está en los datos guardados. Se ha actualizado el tablero.",
  completada: "La tarea ya está completada y no puede volver a Pendiente ni a En curso.",
  capacidad: `En curso ya tiene ${MAX_TAREAS_EN_CURSO} tareas. Devuelve una a Pendiente antes de ingresar otra.`,
};

export default function Tablero() {
  const [consulta, setConsulta] = useState<LecturaTareas | { estado: "cargando" }>({ estado: "cargando" });
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [registroConfirmado, setRegistroConfirmado] = useState(false);
  const botonNuevaTarea = useRef<HTMLButtonElement>(null);
  const devolverFoco = useRef(false);
  const [idMoviendo, setIdMoviendo] = useState<string | null>(null);
  const movimientoEnCurso = useRef(false);
  const focoTarea = useRef<string | null>(null);
  const [mensajeMovimiento, setMensajeMovimiento] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);

  async function mover(id: string, destino: "pendiente" | "en_curso") {
    if (movimientoEnCurso.current || formularioVisible) return;
    movimientoEnCurso.current = true;
    setIdMoviendo(id);
    setRegistroConfirmado(false);
    setMensajeMovimiento(null);

    const resultado = await moverTarea(id, destino);
    focoTarea.current = id;
    if (resultado.tareas) setConsulta({ estado: "lista", tareas: resultado.tareas });
    setMensajeMovimiento(resultado.estado === "guardada"
      ? { tipo: "exito", texto: `Tarea en ${destino === "en_curso" ? "En curso" : "Pendiente"}. Cambio confirmado.` }
      : { tipo: "error", texto: erroresMovimiento[resultado.motivo] });
    movimientoEnCurso.current = false;
    setIdMoviendo(null);
  }

  useEffect(() => {
    if (focoTarea.current && !idMoviendo) {
      const accion = document.getElementById(`mover-${focoTarea.current}`);
      (accion ?? document.getElementById("contenido"))?.focus();
      focoTarea.current = null;
    }
  }, [consulta, idMoviendo]);

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
    return () => { activo = false; };
  }, []);

  const cabecera = (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-(--border) bg-(--surface) px-5 py-5 sm:px-8 lg:px-10">
      <div>
        <h1 className="text-[1.75rem] font-semibold tracking-tight">Mi tablero</h1>
        <p className="mt-1 text-sm leading-6 text-(--text-muted)">Tus tareas, en un solo lugar.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-(--primary-soft) px-3 py-2 text-sm font-medium text-(--primary-text)">Datos en este navegador</span>
        <button ref={botonNuevaTarea} type="button" aria-expanded={formularioVisible} aria-controls="formulario-tarea" disabled={consulta.estado !== "lista" || formularioVisible || idMoviendo !== null} onClick={() => { setRegistroConfirmado(false); setMensajeMovimiento(null); setFormularioVisible(true); }} className="flex min-h-11 items-center gap-2 rounded-lg bg-(--primary) px-4 py-3 text-sm font-semibold text-(--on-primary) enabled:hover:bg-(--primary-hover) enabled:active:bg-(--primary-active) disabled:cursor-default disabled:bg-(--input-border)">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          Nueva tarea
        </button>
      </div>
    </header>
  );

  if (consulta.estado === "cargando") {
    return (
      <div>
        {cabecera}
        <div className="px-5 py-6 sm:px-8 lg:px-10">
          <div role="status" className="rounded-xl border border-(--border) bg-(--surface) px-6 py-12 text-center text-(--text-muted)">
            Cargando tus tareas…
          </div>
        </div>
      </div>
    );
  }

  if (consulta.estado === "error") {
    return (
      <div>
        {cabecera}
        <div className="px-5 py-6 sm:px-8 lg:px-10">
      <section role="alert" className="rounded-xl border border-(--error-border) bg-(--error-bg) p-6">
        <h2 className="text-lg font-semibold text-(--error-text)">No pudimos cargar tus tareas</h2>
        <p className="mt-3 max-w-2xl leading-7 text-(--text-muted)">
          {consulta.motivo === "datos"
            ? "Los datos guardados no tienen un formato válido. No se pueden mostrar las tareas."
            : "No se pueden leer los datos de este sitio. Comprueba que tu navegador permita el almacenamiento local y vuelve a intentarlo."}
        </p>
        <button type="button" onClick={() => window.location.reload()} className="mt-5 min-h-11 rounded-lg bg-(--primary) px-4 py-3 text-sm font-semibold text-(--on-primary) hover:bg-(--primary-hover) active:bg-(--primary-active)">
          Volver a intentar
        </button>
      </section>
        </div>
      </div>
    );
  }

  return (
    <div>
      {cabecera}
      <div className="px-5 py-6 sm:px-8 lg:px-10">
      {formularioVisible && <FormularioTarea onCancelar={cerrarFormulario} onGuardada={(tareas) => {
        setConsulta({ estado: "lista", tareas });
        setRegistroConfirmado(true);
        cerrarFormulario();
      }} />}
      {registroConfirmado && <p role="status" className="mb-5 text-sm text-(--primary-text)">Tarea registrada en Pendiente.</p>}
      {idMoviendo && <p role="status" className="mb-5 text-sm text-(--text-muted)">Guardando movimiento…</p>}
      {mensajeMovimiento && <p role={mensajeMovimiento.tipo === "error" ? "alert" : "status"} className={`mb-5 rounded-lg border p-4 text-sm leading-6 ${mensajeMovimiento.tipo === "error" ? "border-(--error-border) bg-(--error-bg) text-(--error-text)" : "border-(--border) bg-(--surface) text-(--primary-text)"}`}>{mensajeMovimiento.texto}</p>}
      {consulta.tareas.length === 0 && (
        <div role="status" className="mb-6 rounded-xl border border-(--border) bg-(--surface) px-5 py-4">
          <p className="font-semibold">Tu tablero está vacío</p>
          <p className="mt-1 text-sm leading-6 text-(--text-muted)">Registra tu primera tarea para empezar.</p>
        </div>
      )}
      <div className="grid items-start gap-5 md:grid-cols-3" aria-label="Tareas por estado">
        {columnas.map((columna) => {
          const tareas = consulta.tareas.filter((tarea) => tarea.estado === columna.estado);
          return (
            <section key={columna.estado} data-estado={columna.estado} aria-labelledby={`columna-${columna.estado}`} className="columna-tareas min-w-0 rounded-2xl border border-(--border) bg-(--column-bg) p-4">
              <header className="mb-5 flex items-center justify-between gap-3 border-b border-(--border) pb-4">
                <h2 id={`columna-${columna.estado}`} className="text-sm font-semibold tracking-wide text-(--state-text) uppercase">{columna.titulo}</h2>
                <span className="shrink-0 rounded-full bg-(--state-soft) px-2.5 py-1 text-sm font-semibold text-(--state-text) tabular-nums" aria-label={columna.estado === "en_curso" ? `${tareas.length} de ${MAX_TAREAS_EN_CURSO} tareas en curso` : `${tareas.length} tareas`}>
                  {tareas.length}{columna.estado === "en_curso" && ` / ${MAX_TAREAS_EN_CURSO}`}
                </span>
              </header>
              {tareas.length === 0 ? (
                <p className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-(--input-border) px-4 py-8 text-center text-sm leading-6 text-(--text-muted)">{columna.vacio}</p>
              ) : (
                <ul tabIndex={0} aria-label={`Tareas en ${columna.titulo}`} className="space-y-3 overflow-y-auto overscroll-contain px-1 py-1 md:max-h-[calc(100dvh-18rem)]">
                  {tareas.map((tarea) => (
                    <li key={tarea.id} aria-busy={idMoviendo === tarea.id} className="rounded-xl border border-l-4 border-(--border) border-l-(--state-accent) bg-(--surface) p-4 shadow-xs">
                      <p className="text-base leading-7 whitespace-pre-wrap [overflow-wrap:anywhere]">{tarea.titulo}</p>
                      {tarea.estado !== "completada" && (
                        <button id={`mover-${tarea.id}`} type="button" disabled={idMoviendo !== null || formularioVisible} aria-label={`${tarea.estado === "pendiente" ? "Pasar a En curso" : "Volver a Pendiente"}: ${tarea.titulo}`} onClick={() => mover(tarea.id, tarea.estado === "pendiente" ? "en_curso" : "pendiente")} className="mt-4 min-h-11 rounded-lg border border-(--input-border) bg-(--surface) px-3 py-2 text-sm font-medium enabled:hover:bg-(--surface-hover) disabled:cursor-wait disabled:bg-(--surface-hover) disabled:text-(--text-muted)">
                          {idMoviendo === tarea.id ? "Guardando…" : tarea.estado === "pendiente" ? "Pasar a En curso" : "Volver a Pendiente"}
                        </button>
                      )}
                      {tarea.estado === "completada" && <p className="mt-3 flex items-center gap-2 text-sm text-(--done-text)"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="shrink-0 text-(--done-accent)"><path d="m5 12 4 4L19 6" /></svg>Tarea cerrada</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
      </div>
    </div>
  );
}
