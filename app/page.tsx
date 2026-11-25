import Link from "next/link";
import Tablero from "./_components/tablero";

export default function HomePage() {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[232px_1fr]">
      <a className="skip-link" href="#contenido">Saltar al tablero</a>
      <aside className="sidebar flex flex-wrap items-center justify-between gap-4 bg-(--sidebar-bg) px-5 py-4 text-(--sidebar-text) lg:sticky lg:top-0 lg:h-dvh lg:flex-col lg:items-stretch lg:justify-start lg:gap-0 lg:py-7">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-(--primary) text-(--on-primary)" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <path d="m14 18 2.5 2.5L21 15" />
            </svg>
          </span>
          <p className="text-base leading-5 font-semibold">Control de<br />Actividades</p>
        </div>
        <nav aria-label="Navegación principal" className="lg:mt-10">
          <Link href="/" aria-current="page" className="flex min-h-11 items-center gap-3 rounded-lg border-l-2 border-(--sidebar-active-text) bg-(--sidebar-active-bg) px-4 py-3 text-sm font-semibold text-(--sidebar-active-text) hover:bg-(--sidebar-surface)">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M9 4v16m6-16v16" />
            </svg>
            Tablero
          </Link>
        </nav>
      </aside>
      <main id="contenido" tabIndex={-1} className="min-w-0">
        <Tablero />
        <footer className="mx-5 border-t border-(--border) py-5 text-sm leading-6 text-(--text-muted) sm:mx-8 lg:mx-10">
          Si borras los datos de este sitio en el navegador, tus tareas se pierden. No hay respaldos.
        </footer>
      </main>
    </div>
  );
}
