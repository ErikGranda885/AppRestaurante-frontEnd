"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SERVICIOS_AUTH } from "@/services/auth.service";

export function NavUser({
  user,
}: {
  user: {
    nom_usu: string;
    email_usu: string;
    img_usu: string;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  // 🔍 Debug: log de props
  /* console.log("🧑‍💼 Datos del usuario en NavUser:", user); */

  const handleLogout = async () => {
    try {
      await fetch(SERVICIOS_AUTH.logout, {
        method: "POST",
        credentials: "include",
      });
      localStorage.removeItem("empresa_actual");
      router.push("/login");
    } catch {
      alert("No se pudo cerrar sesión. Inténtalo nuevamente.");
    }
  };

  const initials = (() => {
    if (!user.nom_usu || typeof user.nom_usu !== "string") return "";
    const words = user.nom_usu.split(" ").filter((n) => n.length > 0);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return "";
  })();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.img_usu} alt={user.nom_usu} />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.nom_usu}</span>
                <span className="truncate text-xs">{user.email_usu}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg border border-border"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.img_usu} alt={user.nom_usu} />
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.nom_usu}</span>
                  <span className="truncate text-xs">{user.email_usu}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
