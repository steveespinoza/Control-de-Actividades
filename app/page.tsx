export default function HomePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 sm:p-12">
        <p className="text-sm font-semibold tracking-wide text-slate-500">
          Seguimiento del equipo
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Gestión de proyectos
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
          Un espacio para organizar actividades, coordinar responsabilidades y dar
          seguimiento a cada entrega.
        </p>
        <p className="mt-8 border-t border-slate-100 pt-6 text-sm text-slate-500">
          El espacio de trabajo está en preparación.
        </p>
      </section>
    </main>
  );
}
