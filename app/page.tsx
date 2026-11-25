import AppShell from "./_components/app-shell";
import Tablero from "./_components/tablero";

export default function HomePage() {
  return (
    <AppShell>
      <main id="contenido" tabIndex={-1} className="erp-page min-w-0">
        <div className="mx-auto max-w-7xl">
          <Tablero />
          <footer className="mt-8 border-t-2 border-slate-200 pt-5 text-xs leading-6 text-slate-600">
            Si borras los datos de este sitio en el navegador, tus tareas se pierden. No hay respaldos ni restauración.
          </footer>
        </div>
      </main>
    </AppShell>
  );
}
