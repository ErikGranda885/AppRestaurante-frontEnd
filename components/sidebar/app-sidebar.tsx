"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Box,
  CalendarCheck,
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

export const data = {
  user: {
    name: "",
    email: "",
    avatar: "",
  },
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: House, submenu: false },
    {
      title: "Ventas",
      url: "/ventas",
      icon: ShoppingBag,
      submenu: true,
      items: [
        { title: "Nueva venta", url: "/ventas/nueva" },
        { title: "Historial de ventas", url: "/ventas/historial" },
        { title: "Reportes", url: "/ventas/reportes" },
      ],
    },
    {
      title: "Productos",
      url: "/productos",
      icon: Box,
      submenu: true,
      items: [
        { title: "Gestión de categorias", url: "/productos/categorias" },
        { title: "Gestión de productos", url: "/productos/listado" },
        { title: "Reportes", url: "/productos/reportes" },
      ],
    },
    {
      title: "Compras",
      url: "/compras",
      icon: ShoppingCart,
      submenu: true,
      items: [
        { title: "Gestión de Proveedores", url: "/compras/proveedores" },
        { title: "Historial de compras", url: "/compras/historial" },
      ],
    },
    {
      title: "Gastos",
      url: "/gastos-indirectos",
      icon: Receipt,
      submenu: false,
    },
    {
      title: "Cierre Diario",
      url: "/cierre-diario",
      icon: CalendarCheck,
      submenu: false,
    },
  ],
  adminModules: [
    { title: "Usuarios", url: "/usuarios", icon: User, submenu: false },
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
  const [empresaData, setEmpresaData] = useState({
    nombre: "No registrado",
    logo: "/imagenes/empresaDefecto.webp",
  });

  const updateUserData = () => {
    const name = localStorage.getItem("user_name") || "";
    const email = localStorage.getItem("user_email") || "";
    const avatar = localStorage.getItem("user_avatar") || "";
    setUserData({ name, email, avatar });

    // ✅ Obtener datos de empresa
    const empresaLS = localStorage.getItem("empresa_actual");
    if (empresaLS && empresaLS !== "null") {
      try {
        const empresa = JSON.parse(empresaLS);
        setEmpresaData({
          nombre: empresa.nom_emp || "Mi Empresa",
          logo: empresa.logo_emp || "/imagenes/logo.png",
        });
      } catch (error) {
        console.error("Error parsing empresa_actual:", error);
      }
    }
  };

  useEffect(() => {
    updateUserData();

    // ✅ Escuchar cambios de usuario y empresa
    window.addEventListener("userNameUpdated", updateUserData);
    window.addEventListener("empresaUpdated", updateUserData);

    return () => {
      window.removeEventListener("userNameUpdated", updateUserData);
      window.removeEventListener("empresaUpdated", updateUserData);
    };
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
                <div className="relative flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src={empresaData.logo}
                    alt="Logo Empresa"
                    fill
                    className="rounded-md object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {empresaData.nombre}
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
