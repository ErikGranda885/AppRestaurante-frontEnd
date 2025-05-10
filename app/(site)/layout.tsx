"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { AsistenteVoz } from "@/components/shared/asistente/asistenteVoz";
import { ModeToggle } from "@/components/shared/varios/modeToogle";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* ✅ Botón fijo arriba a la derecha */}
      <div className="fixed right-4 top-4 z-50">
        <ModeToggle />
      </div>

      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="dark:bg-[#09090b]">{children}</SidebarInset>

        <footer className="fixed bottom-4 right-4 z-50">
          <AsistenteVoz />
        </footer>
      </SidebarProvider>
    </>
  );
}
