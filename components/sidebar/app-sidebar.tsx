// app/components/sidebar/app-sidebar.tsx
"use client";

import * as React from "react";
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

// Exporta la data para poder usarla en otros componentes, como el breadcrumb
export const data = {
  user: {
    name: "Erik Granda",
    email: "dicolaic.erikgranda@gmail.com",
    avatar: "/avatars/shadcn.jpg",
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
  return (
    <Sidebar
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
            >
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img
                    src="/imagenes/logo.png"
                    alt=""
                  />
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
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
