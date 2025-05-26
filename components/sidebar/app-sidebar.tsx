"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Box,
  CalendarCheck,
  Factory,
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
import { DEFAULT_EMPRESA_IMAGE_URL } from "@/lib/constants";
import { useUsuarioAutenticado } from "@/hooks/usuarios/useUsuarioAutenticado";

type NavItem = {
  title: string;
  url: string;
  icon?: any;
  submenu?: boolean;
  roles?: string[];
  items?: NavItem[];
};

type DataSidebar = {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  navMain: NavItem[];
  adminModules: NavItem[];
};

export const data: DataSidebar = {
  user: {
    name: "",
    email: "",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: House,
      submenu: false,
      roles: ["administrador", "empleado", "sistema"],
    },
    {
      title: "Ventas",
      url: "/ventas",
      icon: ShoppingBag,
      submenu: true,
      roles: ["administrador", "empleado", "sistema"],
      items: [
        { title: "Nueva venta", url: "/ventas/nueva" },
        { title: "Historial de ventas", url: "/ventas/historial" },
      ],
    },
    {
      title: "Productos",
      url: "/productos",
      icon: Box,
      submenu: true,
      roles: ["administrador", "empleado", "sistema"],
      items: [
        {
          title: "Gestión de categorias",
          url: "/productos/categorias",
          roles: ["administrador", "sistema"],
        },
        {
          title: "Gestión de productos",
          url: "/productos/listado",
          roles: ["administrador", "empleado", "sistema"],
        },
        {
          title: "Gestión de recetas",
          url: "/productos/recetas",
          roles: ["administrador", "sistema"],
        },
      ],
    },
    {
      title: "Producción",
      url: "/produccion",
      icon: Factory,
      submenu: true,
      roles: ["administrador", "empleado", "sistema"],
      items: [
        {
          title: "Gestión de Equivalencias",
          url: "/produccion/equivalencias",
          roles: ["administrador", "sistema"],
        },
        {
          title: "Historial de Transformaciones",
          url: "/produccion/historial",
          roles: ["administrador", "empleado", "sistema"],
        },
      ],
    },
    {
      title: "Compras",
      url: "/compras",
      icon: ShoppingCart,
      submenu: true,
      roles: ["administrador", "empleado", "sistema"],
      items: [
        {
          title: "Gestión de Proveedores",
          url: "/compras/proveedores",
          roles: ["administrador", "sistema"],
        },
        {
          title: "Historial de compras",
          url: "/compras/historial",
          roles: ["administrador", "empleado", "sistema"],
        },
      ],
    },
    {
      title: "Gastos",
      url: "/gastos-indirectos",
      icon: Receipt,
      submenu: false,
      roles: ["administrador", "empleado", "sistema"],
    },
    {
      title: "Cierre Diario",
      url: "/cierre-diario",
      icon: CalendarCheck,
      submenu: false,
      roles: ["administrador", "empleado", "sistema"],
    },
  ],
  adminModules: [
    {
      title: "Usuarios",
      url: "/usuarios",
      icon: User,
      submenu: false,
      roles: ["administrador", "sistema", "empleado"],
    },
    {
      title: "Configuraciones",
      url: "/configuraciones",
      icon: Settings,
      submenu: false,
      roles: ["administrador", "sistema"],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { usuario, rol, isLoading } = useUsuarioAutenticado();

  const [empresaData, setEmpresaData] = useState({
    nombre: "No registrado",
    logo: DEFAULT_EMPRESA_IMAGE_URL,
  });

  useEffect(() => {
    const empresaLS = localStorage.getItem("empresa_actual");
    if (empresaLS && empresaLS !== "null") {
      try {
        const empresa = JSON.parse(empresaLS);
        setEmpresaData({
          nombre: empresa.nom_emp || "Mi Empresa",
          logo:
            empresa.logo_emp && empresa.logo_emp !== "null"
              ? empresa.logo_emp
              : DEFAULT_EMPRESA_IMAGE_URL,
        });
      } catch (error) {
        console.error("Error al parsear empresa_actual:", error);
      }
    }
  }, []);

  if (isLoading) return null;

  const navMainFiltrado = data.navMain
    .filter((item: NavItem) => item.roles?.includes(rol))
    .map((item: NavItem): NavItem | null => {
      if (item.submenu && Array.isArray(item.items)) {
        const filteredItems = item.items.filter(
          (subitem: NavItem) => !subitem.roles || subitem.roles.includes(rol),
        );
        if (filteredItems.length === 0) return null;
        return { ...item, items: filteredItems };
      }
      return item;
    })
    .filter((item): item is NavItem => item !== null); // <- Type guard

  const adminModulesFiltrado = data.adminModules.filter((item: NavItem) =>
    item.roles?.includes(rol),
  );

  const userData = {
    nom_usu: usuario?.nom_usu ?? "",
    email_usu: usuario?.email_usu ?? "",
    img_usu: usuario?.img_usu ?? "",
  };

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
        <NavMain items={navMainFiltrado} />
        {adminModulesFiltrado.length > 0 && (
          <NavAdmin items={adminModulesFiltrado} />
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
