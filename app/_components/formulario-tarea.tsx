"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { registrarTarea } from "../lib/client/tareas";
import type { Tarea } from "../lib/tareas";

const mensajes = {
  titulo: "Escribe un título que no esté vacío ni contenga solo espacios.",
  acceso: "No se pueden leer tus tareas. Comprueba que el navegador permita guardar datos de este sitio y vuelve a intentarlo.",
  datos: "Los datos guardados no tienen un formato válido. No se ha registrado la tarea.",
  guardado: "No se pudo guardar la tarea. Conservamos tu título para que puedas volver a intentarlo.",
  espera: "Otra pestaña está usando tus tareas y se agotó el tiempo de espera. No se guardó la tarea. Conservamos tu título; vuelve a intentarlo.",
  navegador: "Este navegador no permite guardar tareas de forma segura. Prueba con una versión actualizada de tu navegador.",
};

export default function FormularioTarea({
  onGuardada,
  onCancelar,
}: {
  onGuardada: (tareas: Tarea[]) => void;
  onCancelar: () => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const envioEnCurso = useRef(false);
  const campoTitulo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    campoTitulo.current?.focus();
  }, []);

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
    <form
      id="formulario-tarea"
      aria-labelledby="titulo-formulario"
      aria-busy={guardando}
      onSubmit={guardar}
      noValidate
      className="erp-card erp-card-accent mb-6 p-5 sm:p-6"
    >
      <div className="mb-5 border-b-2 border-slate-100 pb-4">
        <p className="erp-kicker">Registro rápido</p>
        <h2 id="titulo-formulario" className="mt-1 text-lg font-extrabold text-neutral-950">
          Nueva tarea
        </h2>
      </div>

      <label
        htmlFor="titulo-tarea"
        className="mb-1.5 block text-sm font-bold text-slate-700"
      >
        Título de la tarea{" "}
        <span className="font-normal text-slate-600">(obligatorio)</span>
      </label>
      <input
        ref={campoTitulo}
        id="titulo-tarea"
        name="titulo"
        type="text"
        required
        value={titulo}
        onChange={(evento) => setTitulo(evento.target.value)}
        readOnly={guardando}
        aria-invalid={error === mensajes.titulo}
        aria-describedby={`ayuda-titulo${error ? " error-tarea" : ""}`}
        placeholder="Ej. Revisar presupuesto del trimestre"
        className="min-h-12 w-full border border-slate-500 px-3 py-2.5 text-base placeholder:text-slate-500 aria-[invalid=true]:border-red-600 read-only:bg-slate-100"
      />
      <p id="ayuda-titulo" className="mt-1.5 text-xs text-slate-600">
        Se guardará automáticamente en Pendiente.
      </p>

      <p
        id="error-tarea"
        role="alert"
        aria-atomic="true"
        className={
          error
            ? "mt-3 border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700"
            : undefined
        }
      >
        {error}
      </p>

      <p
        role="status"
        aria-atomic="true"
        className={guardando ? "mt-3 text-sm font-semibold text-slate-600" : undefined}
      >
        {guardando ? "Guardando tarea…" : ""}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t-2 border-slate-100 pt-4">
        <button
          type="button"
          onClick={onCancelar}
          disabled={guardando}
          className="min-h-11 border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 enabled:hover:bg-slate-50 disabled:cursor-wait disabled:bg-slate-100 disabled:text-slate-600"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={guardando}
          className="min-h-11 bg-neutral-950 px-5 py-2.5 text-sm font-bold text-white enabled:hover:bg-black disabled:cursor-wait disabled:bg-neutral-300 disabled:text-neutral-600"
        >
          {guardando ? "Guardando…" : "Guardar tarea"}
        </button>
      </div>
    </form>
  );
}
