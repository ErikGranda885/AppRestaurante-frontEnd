"use client";

import { AsistenteVoz } from "@/components/shared/asistente/asistenteVoz";
import { ModeToggle } from "@/components/shared/varios/modeToogle";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Botón de modo oscuro */}
      <div className="fixed right-4 top-4 z-50">
        <ModeToggle />
      </div>

      {/* Contenido de la página (ya incluye el sidebar si corresponde) */}
      {children}

      {/* Asistente de voz */}
      <footer className="fixed bottom-4 right-4 z-50">
        <AsistenteVoz />
      </footer>
    </>
  );
}
