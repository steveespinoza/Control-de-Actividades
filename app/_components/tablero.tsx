"use client";

import { useEffect, useRef, useState } from "react";
import FormularioTarea from "./formulario-tarea";
import { leerTareas, type LecturaTareas } from "../lib/client/tareas";
import { MAX_TAREAS_EN_CURSO, type EstadoTarea } from "../lib/tareas";

const columnas: { estado: EstadoTarea; titulo: string; vacio: string }[] = [
  { estado: "pendiente", titulo: "Pendiente", vacio: "No hay tareas pendientes." },
  { estado: "en_curso", titulo: "En curso", vacio: "No hay tareas en curso." },
  { estado: "completada", titulo: "Completadas", vacio: "Aún no hay tareas completadas." },
];

export default function Tablero() {
  const [consulta, setConsulta] = useState<LecturaTareas | { estado: "cargando" }>({ estado: "cargando" });
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [registroConfirmado, setRegistroConfirmado] = useState(false);
  const botonNuevaTarea = useRef<HTMLButtonElement>(null);
  const devolverFoco = useRef(false);

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

  if (consulta.estado === "cargando") {
    return (
      <div role="status" className="rounded-xl border border-(--border) bg-(--surface) px-6 py-12 text-center text-(--text-muted)">
        Cargando tus tareas…
      </div>
    );
  }

  if (consulta.estado === "error") {
    return (
      <section role="alert" className="rounded-xl border border-(--error-border) bg-(--surface) p-6">
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
    );
  }

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <button ref={botonNuevaTarea} type="button" aria-expanded={formularioVisible} aria-controls="formulario-tarea" disabled={formularioVisible} onClick={() => { setRegistroConfirmado(false); setFormularioVisible(true); }} className="flex min-h-11 items-center gap-2 rounded-lg bg-(--primary) px-4 py-3 text-sm font-semibold text-(--on-primary) hover:bg-(--primary-hover) active:bg-(--primary-active) disabled:cursor-default disabled:opacity-60">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          Nueva tarea
        </button>
      </div>
      {formularioVisible && <FormularioTarea onCancelar={cerrarFormulario} onGuardada={(tareas) => {
        setConsulta({ estado: "lista", tareas });
        setRegistroConfirmado(true);
        cerrarFormulario();
      }} />}
      {registroConfirmado && <p role="status" className="mb-5 text-sm text-(--primary-text)">Tarea registrada en Pendiente.</p>}
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
            <section key={columna.estado} aria-labelledby={`columna-${columna.estado}`} className="min-w-0 rounded-xl border border-(--border) bg-(--surface) p-4">
              <header className="mb-5 flex items-center justify-between gap-3 border-b border-(--border) pb-4">
                <h2 id={`columna-${columna.estado}`} className="text-base font-semibold">{columna.titulo}</h2>
                <span className={`shrink-0 rounded-md px-2 py-1 text-sm font-medium tabular-nums ${columna.estado === "en_curso" ? "bg-(--primary-soft) text-(--primary-text)" : "bg-(--app-bg) text-(--text-muted)"}`} aria-label={columna.estado === "en_curso" ? `${tareas.length} de ${MAX_TAREAS_EN_CURSO} tareas en curso` : `${tareas.length} tareas`}>
                  {tareas.length}{columna.estado === "en_curso" && ` / ${MAX_TAREAS_EN_CURSO}`}
                </span>
              </header>
              {tareas.length === 0 ? (
                <p className="rounded-lg border border-dashed border-(--border) px-4 py-10 text-center text-sm leading-6 text-(--text-muted)">{columna.vacio}</p>
              ) : (
                <ul className="space-y-3">
                  {tareas.map((tarea) => (
                    <li key={tarea.id} className="rounded-lg border border-(--border) bg-(--app-bg) p-4">
                      <p className="text-base leading-7 whitespace-pre-wrap [overflow-wrap:anywhere]">{tarea.titulo}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
