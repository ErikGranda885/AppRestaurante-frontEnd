"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  AudioWaveform,
  Bot,
  Box,
  CalendarCheck,
  Command,
  GalleryVerticalEnd,
  House,
  Receipt,
  Settings,
  ShoppingBag,
  ShoppingCart,
  User,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavAdmin } from "./nav-admin";

// Define la data con valores fijos para el usuario
export const data = {
  user: {
    name: "",
    email: "",
    avatar: "",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: House,
      submenu: false,
      isActive: true,
    },
    {
      title: "Ventas",
      url: "/ventas",
      icon: ShoppingBag,
      submenu: true,
      isActive: true,
      items: [
        {
          title: "Nueva venta",
          url: "/ventas/nueva",
        },
        {
          title: "Historial de ventas",
          url: "/ventas/historial",
        },
        {
          title: "Reportes",
          url: "/ventas/reportes",
        },
      ],
    },
    {
      title: "Inventario",
      url: "/inventario",
      icon: Box,
      submenu: true,
      items: [
        {
          title: "Gestion de Categorias",
          url: "/inventario/categorias",
        },
        {
          title: "Gestion de Productos",
          url: "/inventario/productos",
        },
        {
          title: "Reportes",
          url: "/inventario/reportes",
        },
      ],
    },
    {
      title: "Compras",
      url: "/compras",
      icon: ShoppingCart,
      submenu: false,
    },
    {
      title: "Cierre Diario",
      url: "/cierre-diario",
      icon: CalendarCheck,
      submenu: false,
    },
    {
      title: "Gastos Indirectos",
      url: "/gastos-indirectos",
      icon: Receipt,
      submenu: false,
    },
  ],
  adminModules: [
    {
      title: "Asistente de voz",
      url: "/asistente-voz",
      icon: Bot,
      submenu: false,
    },
    {
      title: "Usuarios",
      url: "/usuarios",
      icon: User,
      submenu: false,
    },
    {
      title: "Configuraciones",
      url: "/configuraciones",
      icon: Settings,
      submenu: false,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userData, setUserData] = useState(data.user);

  useEffect(() => {
    // Se ejecuta únicamente en el cliente
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("user_name") || "";
      const email = localStorage.getItem("user_email") || "";
      const avatar = localStorage.getItem("user_avatar") || "";
      setUserData({ name, email, avatar });
    }
  }, []);

  return (
    <Sidebar
      collapsible="icon"
      className="border-none bg-[#fafafa] dark:bg-[#18181b]"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img src="/imagenes/logo.png" alt="Logo" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Shawarma la estación
                  </span>
                  <span className="truncate text-xs">Administración</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavAdmin items={data.adminModules} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
