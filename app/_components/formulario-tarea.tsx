"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { registrarTarea } from "../lib/client/tareas";
import type { Tarea } from "../lib/tareas";

const mensajes = {
  titulo: "Escribe un título que no esté vacío ni contenga solo espacios.",
  acceso: "No se pueden leer tus tareas. Comprueba que el navegador permita guardar datos de este sitio y vuelve a intentarlo.",
  datos: "Los datos guardados no tienen un formato válido. No se ha registrado la tarea.",
  guardado: "No se pudo guardar la tarea. Conservamos tu título para que puedas volver a intentarlo.",
  navegador: "Este navegador no permite guardar tareas de forma segura. Prueba con una versión actualizada de tu navegador.",
};

export default function FormularioTarea({ onGuardada, onCancelar }: {
  onGuardada: (tareas: Tarea[]) => void;
  onCancelar: () => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const envioEnCurso = useRef(false);
  const campoTitulo = useRef<HTMLInputElement>(null);

  useEffect(() => { campoTitulo.current?.focus(); }, []);

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (envioEnCurso.current) return;
    if (titulo.trim().length === 0) {
      setError(mensajes.titulo);
      campoTitulo.current?.focus();
      return;
    }

    envioEnCurso.current = true;
    setGuardando(true);
    setError(null);
    const resultado = await registrarTarea(titulo);
    envioEnCurso.current = false;
    setGuardando(false);

    if (resultado.estado === "error") {
      setError(mensajes[resultado.motivo]);
      campoTitulo.current?.focus();
      return;
    }
    onGuardada(resultado.tareas);
  }

  return (
    <form id="formulario-tarea" aria-labelledby="titulo-formulario" aria-busy={guardando} onSubmit={guardar} noValidate className="mb-6 rounded-xl border border-(--border) bg-(--surface) p-5 sm:p-6">
      <h2 id="titulo-formulario" className="mb-5 text-lg font-semibold">Nueva tarea</h2>
      <label htmlFor="titulo-tarea" className="mb-2 block text-sm font-semibold">Título de la tarea <span className="font-normal text-(--text-muted)">(obligatorio)</span></label>
      <input ref={campoTitulo} id="titulo-tarea" name="titulo" type="text" required value={titulo} onChange={(evento) => setTitulo(evento.target.value)} readOnly={guardando} aria-invalid={error === mensajes.titulo} aria-describedby={`ayuda-titulo${error ? " error-tarea" : ""}`} className="min-h-12 w-full rounded-lg border border-(--input-border) bg-(--surface) px-3 py-3 text-base aria-[invalid=true]:border-(--error-border) read-only:bg-(--surface-hover)" />
      <p id="ayuda-titulo" className="mt-2 text-sm leading-6 text-(--text-muted)">Se guardará en Pendiente.</p>
      {error && <p id="error-tarea" role="alert" className="mt-3 rounded-lg border border-(--error-border) bg-(--error-bg) p-3 text-sm leading-6 text-(--error-text)">{error}</p>}
      {guardando && <p role="status" className="mt-3 text-sm text-(--text-muted)">Guardando tarea…</p>}
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="submit" disabled={guardando} className="min-h-11 rounded-lg bg-(--primary) px-4 py-3 text-sm font-semibold text-(--on-primary) enabled:hover:bg-(--primary-hover) enabled:active:bg-(--primary-active) disabled:cursor-wait disabled:bg-(--input-border)">{guardando ? "Guardando…" : "Guardar tarea"}</button>
        <button type="button" onClick={onCancelar} disabled={guardando} className="min-h-11 rounded-lg border border-(--input-border) bg-(--surface) px-4 py-3 text-sm font-semibold enabled:hover:bg-(--surface-hover) disabled:cursor-wait disabled:bg-(--surface-hover) disabled:text-(--text-muted)">Cancelar</button>
      </div>
    </form>
  );
}
