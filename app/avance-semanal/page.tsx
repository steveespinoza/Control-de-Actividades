import type { Metadata } from "next";
import AppShell from "../_components/app-shell";
import AvanceSemanal from "../_components/avance-semanal";

export const metadata: Metadata = {
  title: "Avance semanal | Control de Actividades",
};

export default function AvanceSemanalPage() {
  return (
    <AppShell vista="avance">
      <main id="contenido" tabIndex={-1} className="erp-page min-w-0">
        <div className="mx-auto max-w-7xl">
          <AvanceSemanal />
        </div>
      </main>
    </AppShell>
  );
}
