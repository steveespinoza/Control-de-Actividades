"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const iconClassName = "h-5 w-5 shrink-0";

export default function AppShell({
  children,
  vista = "tablero",
}: {
  children: ReactNode;
  vista?: "tablero" | "avance";
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const botonMenu = useRef<HTMLButtonElement>(null);
  const botonCerrar = useRef<HTMLButtonElement>(null);

  const cerrarMenu = useCallback(() => {
    setMobileOpen(false);
    if (botonMenu.current?.getClientRects().length) {
      botonMenu.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    botonCerrar.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") cerrarMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, cerrarMenu]);

  return (
    <div className="min-h-dvh bg-background">
      <a className="skip-link" href="#contenido">
        {vista === "tablero" ? "Saltar al tablero" : "Saltar al avance semanal"}
      </a>

      <header className="erp-header-dark fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b-2 border-neutral-800 bg-neutral-950 px-4 text-white lg:hidden">
        <button
          ref={botonMenu}
          type="button"
          aria-label="Abrir menú de navegación"
          aria-controls="app-sidebar"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
          className="flex h-11 w-11 items-center justify-center text-white hover:bg-neutral-800"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center border border-white/25 bg-white/10 text-xs font-extrabold tracking-wider">
            CA
          </span>
          <span className="text-sm font-extrabold tracking-tight">
            Control de Actividades
          </span>
        </div>

        <div className="h-11 w-11" aria-hidden="true" />
      </header>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú de navegación"
          onClick={cerrarMenu}
          className="sidebar-backdrop fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r-2 border-slate-200 bg-background shadow-lg transition-transform duration-200 lg:visible lg:w-64 lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? "visible translate-x-0" : "invisible -translate-x-full"
        }`}
      >
        <div className="flex min-h-20 items-center justify-between border-b-2 border-slate-200 px-5">
          <Link
            href="/"
            onClick={cerrarMenu}
            className="flex items-center gap-3"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center bg-neutral-950 text-sm font-extrabold tracking-wider text-white"
              aria-hidden="true"
            >
              CA
            </span>
            <span>
              <span className="block text-sm font-extrabold leading-tight text-neutral-950">
                Control de Actividades
              </span>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Tablero personal
              </span>
            </span>
          </Link>

          <button
            ref={botonCerrar}
            type="button"
            aria-label="Cerrar menú"
            onClick={cerrarMenu}
            className="flex h-11 w-11 items-center justify-center text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="border-b-2 border-slate-100 px-5 py-4">
          <p className="erp-kicker">Navegación</p>
        </div>

        <nav
          className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
          aria-label="Navegación principal"
        >
          <Link
            href="/"
            onClick={cerrarMenu}
            aria-current={vista === "tablero" ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-bold transition-colors ${
              vista === "tablero"
                ? "border-neutral-950 bg-neutral-100 text-neutral-950"
                : "border-transparent text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-neutral-950"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className={iconClassName}
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="16" rx="1.5" />
              <path d="M9 4v16m6-16v16" />
            </svg>
            <span>Tablero</span>
          </Link>

          <Link
            href="/avance-semanal"
            onClick={cerrarMenu}
            aria-current={vista === "avance" ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-bold transition-colors ${
              vista === "avance"
                ? "border-neutral-950 bg-neutral-100 text-neutral-950"
                : "border-transparent text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-neutral-950"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className={iconClassName}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4h16v16H4V4Zm4 12V9m4 7V7m4 9v-5"
              />
            </svg>
            <span>Avance semanal</span>
          </Link>
        </nav>

        <div className="border-t-2 border-slate-200 p-4">
          <div className="rounded border-2 border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-950">
              Almacenamiento local
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Tus tareas viven en este navegador. Si borras los datos del sitio, se pierden.
            </p>
          </div>
        </div>
      </aside>

      <div className="pt-14 lg:pl-64 lg:pt-0">{children}</div>
    </div>
  );
}
