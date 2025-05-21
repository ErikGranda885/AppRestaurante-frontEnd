"use client";

import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Copy,
  Receipt,
  ReceiptText,
  Save,
  ShoppingCart,
  Weight,
} from "lucide-react";
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
import { useMovimientosDelDia } from "@/hooks/cierresDiarios/useMovimientosDelDia";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { DialogNumeracionEfectivo } from "@/components/shared/cierreDiario/ui/dialogNumeracionEfectivo";
import { SERVICIOS_CIERRES } from "@/services/cierreDiario.service";
import { uploadImage } from "@/firebase/subirImage";
import { ModalModEstado } from "@/components/shared/Modales/modalModEstado";
import { ToastError } from "@/components/shared/toast/toastError";
import { SERVICIOS_VENTAS } from "@/services/ventas.service";
import { ValidarPagoDialog } from "@/components/shared/dashboard/ui/validarPagoDialog";
import { useConfiguracionesVentas } from "@/hooks/configuraciones/generales/useConfiguracionesVentas";
import { safePrice } from "@/utils/format";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function formatoMoneda(valor: any): string {
  return typeof valor === "number"
    ? valor.toFixed(2)
    : Number(valor || 0).toFixed(2);
}

export default function PaginaCierreDia() {
  const { ventasConfig } = useConfiguracionesVentas();
  const router = useRouter();
  const { id } = useParams();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [numeroComprobante, setNumeroComprobante] = useState("");
  const [openDialogNumeracion, setOpenDialogNumeracion] = useState(false);
  const [totalEfectivo, setTotalEfectivo] = useState(0);
  const [abrirConfirmacionCerrar, setAbrirConfirmacionCerrar] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<any | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [ventas, setVentas] = useState<any[]>([]);

  useProtectedRoute();

  const bancos = BANCOS_EMPRESA;
  const [bancoSeleccionado, setBancoSeleccionado] = useState(() => {
    return Array.isArray(bancos) && bancos.length > 0 ? bancos[0].id : "";
  });

  const [usuarioActual, setUsuarioActual] = useState<IUsuario | null>(null);
  const [cierreSeleccionado, setCierreSeleccionado] =
    useState<ICierreDiario | null>(null);

  const bancoInfo = bancos.find((banco) => banco.id === bancoSeleccionado);

  useEffect(() => {
    const userData = localStorage.getItem("usuarioActual");
    if (userData) setUsuarioActual(JSON.parse(userData));

    const cierreData = localStorage.getItem("cierreSeleccionado");
    if (cierreData) {
      const parsed = JSON.parse(cierreData) as ICierreDiario;
      if (parsed.id_cier.toString() === id) {
        setCierreSeleccionado(parsed);
        console.log("📦 Cierre seleccionado:", parsed); // 👈 Aquí
      } else {
        router.push("/cierre-diario");
      }
    } else {
      router.push("/cierre-diario");
    }
  }, [id, router]);

  useEffect(() => {
    const totalGuardado = localStorage.getItem("totalEfectivo");
    if (totalGuardado) {
      setTotalEfectivo(parseFloat(totalGuardado));
    } else {
      setOpenDialogNumeracion(true);
    }
  }, []);

  const fechaCierre = cierreSeleccionado?.fech_cier
    ? new Date(cierreSeleccionado.fech_cier).toISOString().split("T")[0]
    : "";

  const {
    movimientos = { ventas: [], gastos: [], compras: [] },
    isLoading: isLoadingMovimientos,
  } = useMovimientosDelDia(fechaCierre);

  useEffect(() => {
    console.log("fechaCierre enviada al hook:", fechaCierre);
    console.log("movimientos recibidos:", movimientos);
  }, [fechaCierre, movimientos]);

  useEffect(() => {
    if (movimientos?.ventas) {
      setVentas(movimientos.ventas);
    }
  }, [movimientos]);

  useEffect(() => {
    const puedeGuardar =
      cierreSeleccionado?.esta_cier !== "cerrado" && file && numeroComprobante;

    if (puedeGuardar) {
      guardarDeposito();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, numeroComprobante]);

  const totalTransferenciasSistema = Array.isArray(movimientos.ventas)
    ? movimientos.ventas
        .filter((venta: any) => {
          return (
            typeof venta.tip_pag_vent === "string" &&
            venta.tip_pag_vent.toLowerCase() === "transferencia"
          );
        })
        .reduce((acc: number, venta: any) => {
          const total = parseFloat(venta.tot_vent);
          return acc + (!isNaN(total) ? total : 0);
        }, 0)
    : 0;

  const totalEfectivoSistema = Array.isArray(movimientos.ventas)
    ? movimientos.ventas
        .filter((venta: any) => {
          return (
            typeof venta.tip_pag_vent === "string" &&
            venta.tip_pag_vent.toLowerCase() === "efectivo"
          );
        })
        .reduce((acc: number, venta: any) => {
          const total = parseFloat(venta.tot_vent);
          return acc + (!isNaN(total) ? total : 0);
        }, 0)
    : 0;

  const totalFacturasCanceladas = cierreSeleccionado?.tot_compras_pag_cier ?? 0;
  const totalGastos = cierreSeleccionado?.tot_gas_cier ?? 0;

  if (!cierreSeleccionado || isLoadingMovimientos) {
    return <div className="p-6">Cargando...</div>;
  }

  const cerrarDia = async () => {
    if (!cierreSeleccionado || !file || !numeroComprobante) return;

    try {
      const fecha = new Date(cierreSeleccionado.fech_cier)
        .toISOString()
        .split("T")[0];
      const nombrePersonalizado = `${fecha}-${numeroComprobante}`;
      const carpeta = "cierres-diarios";

      const urlComprobante = await uploadImage(
        file,
        carpeta,
        nombrePersonalizado,
      );

      const res = await fetch(
        SERVICIOS_CIERRES.registrarDeposito(cierreSeleccionado.id_cier),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tot_dep_cier: totalEfectivo,
            comp_dep_cier: urlComprobante,
          }),
        },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error desconocido al cerrar el día");
      }

      ToastSuccess({ message: "Cierre diario guardado correctamente" });
      localStorage.removeItem("totalEfectivo");
      setFile(null);
      setPreviewUrl(null);
      setNumeroComprobante("");
      router.push("/cierre-diario");
    } catch (error: any) {
      ToastError({
        message:
          error.message ||
          "No se pudo cerrar el día. Verifica si hay transferencias pendientes por validar.",
      });
    }
  };

  const guardarDeposito = () => {
    if (!file || !numeroComprobante) return;

    const MAX_SIZE_MB = 5;
    const sizeInMB = file.size / (1024 * 1024);
    const isImage = file.type.startsWith("image/");

    if (!isImage || sizeInMB > MAX_SIZE_MB) return;

    ToastSuccess({
      message: "Comprobante de depósito cargado correctamente",
    });
  };

  const totalSistema =
    Number(totalEfectivoSistema ?? 0) + Number(totalTransferenciasSistema ?? 0);

  const totalCajero =
    Number(totalEfectivo ?? 0) +
    Number(totalFacturasCanceladas ?? 0) +
    Number(totalGastos ?? 0);

  const diferenciaCalculada = totalSistema - totalCajero;

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
          />{" "}
          <span className="font-semibold">Regresar a los cierres diarios</span>
        </div>

        <div className="mb-1 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Cierre Diario:
              <span className="ml-2 text-lg font-semibold" title={fechaCierre}>
                {(() => {
                  if (!fechaCierre) return "";
                  const [year, month, day] = fechaCierre.split("-");
                  const fecha = new Date(
                    Number(year),
                    Number(month) - 1,
                    Number(day),
                  );
                  return format(fecha, "dd 'de' MMMM 'de' yyyy", {
                    locale: es,
                  });
                })()}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {cierreSeleccionado.esta_cier !== "cerrado" && (
              <Button
                className="w-[150px] border-border text-[12px] font-semibold"
                variant="primary"
                disabled={totalEfectivo === 0 || !file || !numeroComprobante}
                onClick={() => setAbrirConfirmacionCerrar(true)}
              >
                <Save className="h-4 w-4" /> Cerrar Día
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Cards Resumen */}
      <div className="flex w-full flex-wrap gap-4 px-6 pt-4">
        {/* Columna Izquierda: Resumen Económico */}
        <div className="flex flex-col gap-4">
          <Card className="min-h-[585px] w-[300px] rounded-xl border border-border shadow-md dark:bg-[#1a1a1a]">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-secondary-foreground">
                Resumen Económico
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Totales principales */}
              <div className="flex flex-wrap justify-between gap-2">
                <ResumenItem
                  label="Total Ventas"
                  value={cierreSeleccionado.tot_vent_cier}
                  ocultar={
                    totalEfectivo === 0 &&
                    cierreSeleccionado.esta_cier !== "cerrado"
                  }
                />

                <ResumenItem
                  label={
                    cierreSeleccionado.esta_cier === "cerrado"
                      ? "Valor Depositado"
                      : "Valor a Depositar"
                  }
                  value={
                    cierreSeleccionado.esta_cier === "cerrado"
                      ? cierreSeleccionado.tot_dep_cier
                      : totalEfectivo
                  }
                  ocultar={
                    totalEfectivo === 0 &&
                    cierreSeleccionado.esta_cier !== "cerrado"
                  }
                  resaltado={cierreSeleccionado.esta_cier === "cerrado"}
                />
              </div>
              {/* Detalle Gneral */}
              <div className="space-y-1">
                {/* Detalle del sistema */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Detalle del sistema
                  </p>
                  <div className="flex justify-between text-xs font-medium">
                    <span>Ventas por efectivo</span>
                    <span>
                      {safePrice(
                        Number(totalEfectivoSistema ?? 0),
                        ventasConfig.moneda,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span>Ventas por transferencia</span>
                    <span>
                      {safePrice(
                        Number(totalTransferenciasSistema ?? 0),
                        ventasConfig.moneda,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Total sistema</span>
                    <span>
                      {safePrice(
                        Number(totalEfectivoSistema ?? 0) +
                          Number(totalTransferenciasSistema ?? 0),
                        ventasConfig.moneda,
                      )}
                    </span>
                  </div>
                </div>

                {/* Detalle del cajero */}
                <div className="space-y-2 pt-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Detalle del cajero
                  </p>
                  <div className="flex justify-between text-xs font-medium">
                    <span>Efectivo registrado</span>
                    <span>
                      {safePrice(
                        Number(totalEfectivo ?? 0),
                        ventasConfig.moneda,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span>Compras realizadas</span>
                    <span>
                      {safePrice(
                        Number(totalFacturasCanceladas ?? 0),
                        ventasConfig.moneda,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span>Gastos registrados</span>
                    <span>
                      {safePrice(Number(totalGastos ?? 0), ventasConfig.moneda)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Total cajero</span>
                    <span>
                      {safePrice(Number(totalCajero ?? 0), ventasConfig.moneda)}
                    </span>
                  </div>
                </div>

                {/* Diferencia */}
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>Diferencia</span>
                  <span
                    className={`font-bold ${
                      Number(
                        cierreSeleccionado.esta_cier === "cerrado"
                          ? cierreSeleccionado.dif_cier
                          : diferenciaCalculada,
                      ) === 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {safePrice(
                      Number(
                        cierreSeleccionado.esta_cier === "cerrado"
                          ? cierreSeleccionado.dif_cier
                          : diferenciaCalculada,
                      ),
                      ventasConfig.moneda,
                    )}
                  </span>
                </div>

                {/* Estado del cierre */}
                {cierreSeleccionado.esta_cier === "cerrado" && (
                  <div
                    className={`mt-2 rounded-md px-3 py-2 text-center text-xs font-semibold ${
                      Number(cierreSeleccionado.dif_cier) === 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {Number(cierreSeleccionado.dif_cier) === 0
                      ? "✔️ Cierre cuadrado correctamente"
                      : "❌ El cierre presenta una diferencia"}
                  </div>
                )}
              </div>

              {/* Banco */}
              <div className="">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Seleccionar Banco
                </p>
                <Select onValueChange={(value) => setBancoSeleccionado(value)}>
                  <SelectTrigger className="w-full rounded-md border border-border bg-background dark:bg-[#1a1a1a]">
                    <SelectValue placeholder="Selecciona un banco" />
                  </SelectTrigger>
                  <SelectContent className="bg-background dark:bg-[#1a1a1a]">
                    {bancos.map((banco) => (
                      <SelectItem key={banco.id} value={banco.id}>
                        {banco.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Detalles del banco */}
              {bancoInfo && (
                <div className="space-y-1 rounded-lg border border-border bg-muted/10 p-4 text-xs">
                  <div className="flex w-full items-center gap-3">
                    <Image
                      src={bancoInfo.logo}
                      alt={bancoInfo.nombre}
                      width={60}
                      height={40}
                      className="bg-white object-contain"
                    />
                    <div>
                      <div>
                        <strong>Banco:</strong> {bancoInfo.nombre}
                      </div>
                      <div>
                        <strong>Cuenta:</strong> {bancoInfo.cuenta}
                      </div>
                      <div>
                        <strong>Tipo:</strong> {bancoInfo.tipoCuenta}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-2 w-full text-[11px] font-semibold"
                    onClick={() => {
                      const infoCompleta = `
                  Banco: ${bancoInfo.nombre}
                  Tipo de Cuenta: ${bancoInfo.tipoCuenta}
                  Número de Cuenta: ${bancoInfo.cuenta}
                  Titular: ${bancoInfo.nombreTitular}
                  RUC/CI: ${bancoInfo.rucCi}
                  Correo: ${bancoInfo.correo}
                  Celular: ${bancoInfo.telefono}`.trim();
                      navigator.clipboard.writeText(infoCompleta);
                      ToastSuccess({
                        message: "¡Información copiada exitosamente!",
                      });
                    }}
                  >
                    <Copy className="mr-1 h-4 w-4" /> Copiar información
                    completa
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha */}
        <div className="flex flex-1 flex-col gap-6">
          {/* Gastos y Compras */}
          <div className="flex gap-6">
            {/* Gastos */}
            <Card className="h-[230px] flex-1 border border-border dark:bg-[#1a1a1a]">
              <CardHeader>
                <CardTitle>
                  <div className="mt-4 flex flex-wrap items-center">
                    <ReceiptText className="mr-2 h-4 w-4" /> Gastos del día
                  </div>
                </CardTitle>
              </CardHeader>

              <ScrollArea className="h-[160px]">
                <CardContent className="space-y-2">
                  {/* Encabezados de la tabla */}
                  <div className="grid grid-cols-3 gap-4 border-border pb-2 text-xs font-semibold text-muted-foreground">
                    <span>Descripción</span>
                    <span>Observación</span>
                    <span className="text-right">Monto</span>
                  </div>

                  {/* Contenido dinámico */}
                  {Array.isArray(movimientos.gastos) &&
                  movimientos.gastos.length > 0 ? (
                    movimientos.gastos.map((gasto: any, index: number) => (
                      <div
                        key={index}
                        className="grid grid-cols-3 items-center gap-4 border border-x-transparent border-b-border border-t-transparent py-2 text-sm"
                      >
                        <span>{gasto.desc_gas}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {gasto.obs_gas || "-"}
                        </span>
                        <span
                          className={`text-right font-semibold ${Number(gasto.mont_gas) >= 0 ? "" : "text-red-600"}`}
                        >
                          {safePrice(
                            Number(gasto.mont_gas ?? 0),
                            ventasConfig.moneda,
                          )}
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
            <Card className="flex-1 border border-border dark:bg-[#1a1a1a]">
              <CardHeader>
                <CardTitle>
                  <div className="mt-4 flex flex-wrap items-center">
                    <ShoppingCart className="mr-2 h-4 w-4" /> Compras del día
                  </div>
                </CardTitle>
              </CardHeader>

              {/* Scroll interno */}
              <ScrollArea className="h-[150px]">
                <CardContent className="space-y-2">
                  {/* Encabezados de la tabla */}
                  <div className="grid grid-cols-3 gap-4 border-border pb-2 text-xs font-semibold text-muted-foreground">
                    <span>Proveedor</span>
                    <span>Fecha</span>
                    <span className="text-right">Monto</span>
                  </div>

                  {/* Contenido dinámico */}
                  {Array.isArray(movimientos.compras) &&
                  movimientos.compras.length > 0 ? (
                    movimientos.compras.map((compra: any, index: number) => (
                      <div
                        key={index}
                        className="grid grid-cols-3 items-center gap-4 border border-x-transparent border-b-border border-t-transparent py-2 text-sm"
                      >
                        <span>{compra.prov_comp?.nom_prov || "-"}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(
                            compra.fech_pag_comp || compra.fech_comp,
                          ).toLocaleDateString("es-EC", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-right font-semibold">
                          {safePrice(
                            Number(compra.tot_comp ?? 0),
                            ventasConfig.moneda,
                          )}
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
          <Card className="flex-1 border border-border dark:bg-[#1a1a1a]">
            <CardHeader>
              <CardTitle>
                <div className="mt-4 flex flex-wrap items-center">
                  <Weight className="mr-2 h-4 w-4" /> Ventas del Día
                </div>
              </CardTitle>
            </CardHeader>

            {/* Scroll interno */}
            <ScrollArea className="h-[266px]">
              <CardContent className="space-y-2">
                {/* Encabezados de la tabla */}
                <div className="grid grid-cols-4 gap-4 border-border pb-2 text-xs font-semibold text-muted-foreground">
                  <span>#</span>
                  <span>Tipo de Pago</span>
                  <span>Estado</span>
                  <span className="text-right">Total</span>
                </div>

                {/* Contenido dinámico */}
                {Array.isArray(ventas) && ventas.length > 0 ? (
                  ventas.map((venta: any, index: number) => (
                    <div
                      key={index}
                      className="grid grid-cols-4 items-center gap-4 border border-x-transparent border-b-border border-t-transparent py-2 text-sm"
                    >
                      <span>{venta.id_vent}</span>
                      <span>{venta.tip_pag_vent}</span>

                      <span>
                        {venta.tip_pag_vent?.toLowerCase() ===
                          "transferencia" &&
                        venta.est_vent?.trim().toLowerCase() ===
                          "por validar" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-500 text-[11px] font-semibold text-blue-600 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-700"
                            onClick={() => {
                              setVentaSeleccionada({
                                id_vent: venta.id_vent,
                                comprobante: venta.comprobante_num_vent,
                                imagen: venta.comprobante_img_vent,
                              });
                              setOpenDialog(true);
                            }}
                          >
                            Validar pago
                          </Button>
                        ) : venta.tip_pag_vent?.toLowerCase() ===
                            "transferencia" &&
                          venta.est_vent?.trim().toLowerCase() !==
                            "por validar" ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-green-100 px-2 py-1 text-[11px] font-medium text-green-700">
                            ✔ Validado
                          </span>
                        ) : (
                          <span className="text-[13px] font-medium capitalize text-muted-foreground">
                            {venta.est_vent}
                          </span>
                        )}
                      </span>

                      <span
                        className={`text-right font-semibold ${
                          venta.tot_vent >= 0 ? "" : "text-red-600"
                        }`}
                      >
                        {safePrice(
                          Number(venta.tot_vent ?? 0),
                          ventasConfig.moneda,
                        )}
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
        {/* Deposito */}
        <Card className="w-[410px] border border-border dark:bg-[#1a1a1a]">
          <CardHeader>
            <CardTitle>
              <div className="mt-4 flex flex-wrap items-center">
                <Receipt className="mr-2 h-4 w-4" /> Registrar Depósito
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Número de comprobante y valor */}
            {cierreSeleccionado?.esta_cier !== "cerrado" && (
              <div className="flex justify-between gap-6">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Número de Comprobante
                  </label>
                  <Input
                    type="text"
                    placeholder="Ej: 1234567890"
                    value={numeroComprobante}
                    onChange={(e) => setNumeroComprobante(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Imagen del comprobante */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Imagen del Comprobante
              </label>

              {cierreSeleccionado?.esta_cier === "cerrado" ? (
                <div
                  className="group relative h-[500px] w-full overflow-hidden rounded-md border-2 border-border bg-white dark:bg-[#1a1a1a]"
                  onMouseMove={(e) => {
                    const container = e.currentTarget;
                    const img = container.querySelector(
                      "img",
                    ) as HTMLImageElement;
                    const rect = container.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    img.style.transformOrigin = `${x}% ${y}%`;
                    img.style.transform = "scale(2)";
                  }}
                  onMouseLeave={(e) => {
                    const img = e.currentTarget.querySelector(
                      "img",
                    ) as HTMLImageElement;
                    img.style.transformOrigin = "center";
                    img.style.transform = "scale(1)";
                  }}
                >
                  {cierreSeleccionado.comp_dep_cier ? (
                    <Image
                      src={cierreSeleccionado.comp_dep_cier}
                      alt="Comprobante de depósito"
                      fill
                      sizes="100%"
                      className="object-contain p-2 transition-transform duration-300 ease-in-out"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                      Sin comprobante disponible
                    </div>
                  )}
                </div>
              ) : (
                <label
                  className="relative flex w-full flex-col items-center justify-center rounded-md border-2 border-dashed p-6 text-center hover:cursor-pointer hover:border-secondary dark:bg-[#1a1a1a]"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.add("border-secondary");
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove("border-secondary");
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith("image/")) {
                      setPreviewUrl(URL.createObjectURL(file));
                      setFile(file);
                      ToastSuccess({
                        message: "¡Imagen cargada exitosamente!",
                      });
                    }
                  }}
                >
                  {previewUrl ? (
                    <div
                      className="relative h-[300px] w-full overflow-hidden rounded-md bg-cover bg-center"
                      style={{ backgroundImage: `url(${previewUrl})` }}
                      onMouseMove={(e) => {
                        const { left, top, width, height } =
                          e.currentTarget.getBoundingClientRect();
                        const x = ((e.clientX - left) / width) * 100;
                        const y = ((e.clientY - top) / height) * 100;
                        e.currentTarget.style.backgroundPosition = `${x}% ${y}%`;
                        e.currentTarget.style.backgroundSize = "200%";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundPosition = "center";
                        e.currentTarget.style.backgroundSize = "contain";
                      }}
                    />
                  ) : (
                    <div className="flex h-[300px] items-center justify-center">
                      <div className="flex flex-col items-center justify-center">
                        <Receipt className="mb-2 w-8 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          Arrastra o haz click para seleccionar
                        </p>
                      </div>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) {
                        setPreviewUrl(URL.createObjectURL(selectedFile));
                        setFile(selectedFile);
                      }
                    }}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </label>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {cierreSeleccionado.esta_cier !== "cerrado" && (
        <DialogNumeracionEfectivo
          open={openDialogNumeracion}
          onOpenChange={(open) => {
            if (!open) {
              // Cualquier forma de cerrar el diálogo (X, click fuera, botón cancelar)
              router.push("/cierre-diario");
            }
          }}
          onGuardar={(total) => {
            setTotalEfectivo(total);
            localStorage.setItem("totalEfectivo", total.toString());
            setOpenDialogNumeracion(false); // Cierra el modal si se guarda
          }}
        />
      )}

      <ModalModEstado
        abierto={abrirConfirmacionCerrar}
        onCambioAbierto={setAbrirConfirmacionCerrar}
        tipoAccion="activar"
        nombreElemento={`del ${fechaCierre}`}
        tituloPersonalizado="¿Confirmar cierre del día?"
        descripcionPersonalizada="Al cerrar el día se registrará todos los datos y no se podrá modificar los datos."
        textoConfirmar="Cerrar día"
        textoCancelar="Cancelar"
        onConfirmar={async () => {
          setAbrirConfirmacionCerrar(false);
          await cerrarDia();
        }}
      />
      {ventaSeleccionada && (
        <ValidarPagoDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          venta={ventaSeleccionada}
          onConfirm={async (id_vent: number) => {
            await fetch(SERVICIOS_VENTAS.actualizarEstado(id_vent), {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ est_vent: "Cerrada" }),
            });

            ToastSuccess({ message: "Pago validado correctamente" });
            setOpenDialog(false);
            setVentaSeleccionada(null);

            // Actualiza solo esa venta en el estado
            setVentas((prev) =>
              prev.map((venta) =>
                venta.id_vent === id_vent
                  ? { ...venta, est_vent: "Cerrada" }
                  : venta,
              ),
            );
          }}
        />
      )}
    </ModulePageLayout>
  );
}

function ResumenItem({
  label,
  value,
  ocultar = false,
  resaltado = false,
}: {
  label: string;
  value: number | undefined;
  ocultar?: boolean;
  resaltado?: boolean;
}) {
  const { ventasConfig } = useConfiguracionesVentas();
  const valorSeguro = safePrice(Number(value ?? 0), ventasConfig.moneda);

  return (
    <div className="space-y-1">
      <div
        className={`text-xs font-medium uppercase tracking-wide ${
          resaltado ? "" : "text-muted-foreground"
        }`}
      >
        {label}
      </div>
      <div
        className={`text-end text-3xl font-bold ${
          resaltado
            ? "text-green-700 dark:text-green-300"
            : "text-gray-900 dark:text-white"
        }`}
      >
        {ocultar ? "$*.**" : valorSeguro}
      </div>
    </div>
  );
}
