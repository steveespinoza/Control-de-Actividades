import Link from "next/link";
import Tablero from "./_components/tablero";

export default function HomePage() {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[232px_1fr]">
      <a className="skip-link" href="#contenido">Saltar al tablero</a>
      <aside className="border-b border-(--border) bg-(--sidebar-bg) px-6 py-5 lg:min-h-dvh lg:border-r lg:border-b-0 lg:px-5 lg:py-8">
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
        <nav aria-label="Navegación principal" className="mt-6 lg:mt-12">
          <Link href="/" aria-current="page" className="flex min-h-11 items-center gap-3 rounded-lg border-l-2 border-(--primary) bg-(--primary-soft) px-4 py-3 text-sm font-semibold text-(--primary-text)">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M9 4v16m6-16v16" />
            </svg>
            Tablero
          </Link>
        </nav>
      </aside>
      <main id="contenido" tabIndex={-1} className="min-w-0 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm text-(--text-muted)">Mi espacio personal</p>
            <h1 className="text-3xl font-semibold tracking-tight">Mi tablero</h1>
            <p className="mt-3 text-base text-(--text-muted)">Tus tareas, en un solo lugar.</p>
          </div>
          <span className="rounded-lg border border-(--border) px-3 py-2 text-sm text-(--text-muted)">Datos en este navegador</span>
        </header>
        <Tablero />
        <footer className="mt-8 border-t border-(--border) pt-5 text-sm leading-6 text-(--text-muted)">
          Si borras los datos de este sitio en el navegador, tus tareas se pierden. No hay respaldos.
        </footer>
      </main>
    </div>
  );
}
