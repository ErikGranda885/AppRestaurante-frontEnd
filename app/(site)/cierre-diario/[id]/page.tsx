"use client";

import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowDownToLine, ArrowLeft, Pencil, Weight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BANCOS_EMPRESA } from "../../configuraciones/infoEmpresa";
import Image from "next/image";
import { ICierreDiario, IUsuario } from "@/lib/types";
import { useMovimientosDelDia } from "@/hooks/cierresDiarios/useMovimientosDelDia"; // <--- Aquí importamos el hook
import { ScrollArea } from "@/components/ui/scroll-area";
interface Movimiento {
  descripcion: string;
  monto: number;
}

export default function Dashboard() {
  const router = useRouter();
  const { id } = useParams();
  useProtectedRoute();

  const bancos = BANCOS_EMPRESA;
  const [bancoSeleccionado, setBancoSeleccionado] = useState(
    bancos.length > 0 ? bancos[0].id : "",
  );
  const [usuarioActual, setUsuarioActual] = useState<IUsuario | null>(null);
  const [cierreSeleccionado, setCierreSeleccionado] =
    useState<ICierreDiario | null>(null);

  const bancoInfo = bancos.find((banco) => banco.id === bancoSeleccionado);

  /* Cargar usuario y cierre */
  useEffect(() => {
    const userData = localStorage.getItem("usuarioActual");
    if (userData) {
      setUsuarioActual(JSON.parse(userData));
    }

    const cierreData = localStorage.getItem("cierreSeleccionado");
    if (cierreData) {
      const parsed = JSON.parse(cierreData) as ICierreDiario;
      if (parsed.id_cier.toString() === id) {
        setCierreSeleccionado(parsed);
      } else {
        router.push("/cierre-diario");
      }
    } else {
      router.push("/cierre-diario");
    }
  }, [id, router]);

  const fechaCierre = cierreSeleccionado?.fech_cier ?? "";

  const { movimientos, isLoading: isLoadingMovimientos } =
    useMovimientosDelDia(fechaCierre);

  if (!cierreSeleccionado || isLoadingMovimientos)
    return <div className="p-6">Cargando...</div>;

  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Dashboard"
      breadcrumbPageTitle=""
      submenu={false}
      isLoading={false}
    >
      {/* Encabezado */}
      <div className="px-6">
        <div className="mb-2 flex items-center gap-2 dark:text-gray-400">
          <ArrowLeft
            className="h-8 w-8 cursor-pointer"
            onClick={() => router.back()}
          />
        </div>

        <div className="mb-1 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Cierre Diario:
              <span className="ml-2 text-lg font-semibold">
                {new Date(fechaCierre).toLocaleDateString("es-EC", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              className="border-border text-[12px] font-semibold"
              variant="secondary"
            >
              <Pencil className="h-4 w-4" /> Editar
            </Button>

            <Button
              className="border-border text-[12px] font-semibold"
              variant="secondary"
            >
              <ArrowDownToLine className="h-4 w-4" /> Descargar
            </Button>
          </div>
        </div>
      </div>

      {/* Cards Resumen */}
      <div className="flex w-full flex-wrap gap-4 px-6 pt-4">
        {/* Columna Izquierda */}
        <div className="flex flex-col gap-2">
          <Card className="h-[485px] w-[320px]">
            <CardHeader>
              <CardTitle>Resumen Económico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <ResumenItem
                  label="Total Ventas"
                  value={cierreSeleccionado.tot_vent_cier}
                />
                <ResumenItem
                  label="Total Gastos"
                  value={cierreSeleccionado.tot_gas_cier}
                />
                <ResumenItem
                  label="Total Compras Pagadas"
                  value={cierreSeleccionado.tot_compras_pag_cier}
                />
                <ResumenItem
                  label="Total Depositado"
                  value={cierreSeleccionado.tot_dep_cier}
                />
                <ResumenItem
                  label="Diferencia"
                  value={cierreSeleccionado.dif_cier}
                />
              </div>

              {/* Seleccionar Banco */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                  Seleccionar Banco
                </h3>
                <Select onValueChange={(value) => setBancoSeleccionado(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {bancos.map((banco) => (
                      <SelectItem key={banco.id} value={banco.id}>
                        {banco.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Banco info */}
              {bancoInfo && (
                <div className="mt-6 rounded-md border p-4 text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <Image
                        src={bancoInfo.logo}
                        alt={bancoInfo.nombre}
                        width={60}
                        height={60}
                        className="bg-white object-contain"
                      />
                    </div>
                    <div className="space-y-1">
                      <div>
                        <strong>Banco:</strong> {bancoInfo.nombre}
                      </div>
                      <div>
                        <strong>Cuenta:</strong> {bancoInfo.cuenta}
                      </div>
                      <div>
                        <strong>Tipo de Cuenta:</strong> {bancoInfo.tipoCuenta}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Responsable de cierre */}
          <Card className="h-[90px] w-[320px]">
            <CardHeader className="h-2">
              <CardTitle>Responsable de Cierre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs">
                <div className="h-8 w-8 flex-shrink-0">
                  <Image
                    src={usuarioActual?.img_usu || "/default-avatar.png"}
                    alt={usuarioActual?.nom_usu || "Usuario"}
                    width={100}
                    height={100}
                    className="h-full w-full rounded-md object-cover"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    {usuarioActual?.nom_usu || "Usuario"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {usuarioActual?.rol_usu.nom_rol || "Rol no definido"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha */}
        <div className="flex flex-1 flex-col gap-6">
          {/* Gastos y Compras */}
          <div className="flex gap-6">
            {/* Gastos */}
            <Card className="h-[230px] flex-1">
              <CardHeader>
                <CardTitle>Gastos del Día</CardTitle>
              </CardHeader>

              <ScrollArea className="h-[300px]">
                <CardContent className="space-y-2">
                  {/* Encabezados de la tabla */}
                  <div className="grid grid-cols-3 gap-4 border-b pb-2 text-xs font-semibold text-muted-foreground">
                    <span>Descripción</span>
                    <span>Observación</span>
                    <span className="text-right">Monto</span>
                  </div>

                  {/* Contenido dinámico */}
                  {movimientos.gastos.length > 0 ? (
                    movimientos.gastos.map((gasto: any, index: number) => (
                      <div
                        key={index}
                        className="grid grid-cols-3 items-center gap-4 border-b py-2 text-sm"
                      >
                        <span>{gasto.desc_gas}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {gasto.obs_gas || "-"}
                        </span>
                        <span
                          className={`text-right font-semibold ${
                            gasto.mont_gas >= 0 ? "" : "text-red-600"
                          }`}
                        >
                          ${gasto.mont_gas.toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="pt-4 text-sm text-muted-foreground">
                      No hay gastos registrados
                    </p>
                  )}
                </CardContent>
              </ScrollArea>
            </Card>

            {/* Compras */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Compras Pagadas</CardTitle>
              </CardHeader>

              {/* Scroll interno */}
              <ScrollArea className="h-[110px]">
                <CardContent className="space-y-2">
                  {/* Encabezados de la tabla */}
                  <div className="grid grid-cols-3 gap-4 border-b pb-2 text-xs font-semibold text-muted-foreground">
                    <span>Proveedor</span>
                    <span>Fecha</span>
                    <span className="text-right">Monto</span>
                  </div>

                  {/* Contenido dinámico */}
                  {movimientos.compras.length > 0 ? (
                    movimientos.compras.map((compra: any, index: number) => (
                      <div
                        key={index}
                        className="grid grid-cols-3 items-center gap-4 border-b py-2 text-sm"
                      >
                        <span>{compra.proveedor}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(compra.fecha).toLocaleDateString("es-EC", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span
                          className={`text-right font-semibold ${
                            compra.monto >= 0 ? "" : "text-red-600"
                          }`}
                        >
                          ${compra.monto.toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="pt-4 text-sm text-muted-foreground">
                      No hay compras registradas
                    </p>
                  )}
                </CardContent>
              </ScrollArea>
            </Card>
          </div>

          {/* Ventas */}
          <Card className="h-auto">
            <CardHeader>
              <CardTitle>
                <div className="flex flex-wrap items-center">
                  <Weight className="mr-2 h-4 w-4" /> Ventas del Día
                </div>
              </CardTitle>
            </CardHeader>

            {/* Scroll interno */}
            <ScrollArea className="h-[266px]">
              <CardContent className="space-y-2">
                {/* Encabezados de la tabla */}
                <div className="grid grid-cols-4 gap-4 border-b pb-2 text-xs font-semibold text-muted-foreground">
                  <span>#</span>
                  <span>Tipo de Pago</span>
                  <span>Estado</span>
                  <span className="text-right">Total</span>
                </div>

                {/* Contenido dinámico */}
                {movimientos.ventas.length > 0 ? (
                  movimientos.ventas.map((venta: any, index: number) => (
                    <div
                      key={index}
                      className="grid grid-cols-4 items-center gap-4 border-b py-2 text-sm"
                    >
                      <span>{venta.id_vent}</span>
                      <span>{venta.tip_pag_vent}</span>
                      <span>{venta.est_vent}</span>
                      <span
                        className={`text-right font-semibold ${
                          venta.tot_vent >= 0 ? "" : "text-red-600"
                        }`}
                      >
                        ${venta.tot_vent.toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="pt-4 text-sm text-muted-foreground">
                    No hay ventas registradas
                  </p>
                )}
              </CardContent>
            </ScrollArea>
          </Card>

          {/* Deposito */}
          
        </div>
      </div>
    </ModulePageLayout>
  );
}

// Componentes auxiliares
function ResumenItem({
  label,
  value,
}: {
  label: string;
  value: number | undefined;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        ${(value ?? 0).toFixed(2)}
      </div>
    </div>
  );
}

function SubCardItem({
  label,
  value,
  obs,
}: {
  label: string;
  value: number;
  obs?: string;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span>{obs}</span>
      <span className="font-semibold">${(value ?? 0).toFixed(2)}</span>
    </div>
  );
}
