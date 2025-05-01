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
import { useMovimientosDelDia } from "@/hooks/cierresDiarios/useMovimientosDelDia"; // <--- Aquí importamos el hook
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { DialogNumeracionEfectivo } from "@/components/shared/cierreDiario/ui/dialogNumeracionEfectivo";
interface Movimiento {
  descripcion: string;
  monto: number;
}

export default function PaginaCierreDia() {
  const router = useRouter();
  const { id } = useParams();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [numeroComprobante, setNumeroComprobante] = useState("");
  const [valorDeposito, setValorDeposito] = useState("");
  const [openDialogNumeracion, setOpenDialogNumeracion] = useState(true);
  const [totalEfectivo, setTotalEfectivo] = useState(0);
  const [cerradoPorGuardado, setCerradoPorGuardado] = useState(false);
  const [fueGuardadoEfectivo, setFueGuardadoEfectivo] = useState(false);

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

  /* Almacenar totalEfectivo */
  useEffect(() => {
    const totalGuardado = localStorage.getItem("totalEfectivo");
    if (totalGuardado) {
      setTotalEfectivo(parseFloat(totalGuardado));
      setOpenDialogNumeracion(false);
    } else {
      setOpenDialogNumeracion(true);
    }
  }, []);

  /* Cerrar Dia */
  const handleCerrarDia = () => {
    // lógica de cierre...
    localStorage.removeItem("totalEfectivo");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };
  const fechaCierre = cierreSeleccionado?.fech_cier ?? "";

  const { movimientos, isLoading: isLoadingMovimientos } =
    useMovimientosDelDia(fechaCierre);

  const totalTransferencias = movimientos.ventas
    .filter(
      (venta: any) => venta.tip_pag_vent.toLowerCase() === "transferencia",
    )
    .reduce((acc: number, venta: any) => acc + venta.tot_vent, 0);

  const totalFacturasCanceladas = cierreSeleccionado?.tot_compras_pag_cier ?? 0;
  const totalGastos = cierreSeleccionado?.tot_gas_cier ?? 0;

  const diferenciaCalculada =
    (cierreSeleccionado?.tot_vent_cier ?? 0) -
    (totalEfectivo +
      totalTransferencias +
      totalGastos +
      totalFacturasCanceladas);

  if (!cierreSeleccionado || isLoadingMovimientos) {
    return <div className="p-6">Cargando...</div>;
  }

  // Mostrar solo el diálogo si aún no se registra el efectivo
  if (totalEfectivo === 0 && !openDialogNumeracion) {
    setOpenDialogNumeracion(true);
    return null; // Evita el render completo
  }

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
              className="w-[150px] border-border text-[12px] font-semibold"
              variant="primary"
              disabled={totalEfectivo === 0}
            >
              <Save className="h-4 w-4" /> Cerrar Día
            </Button>
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
                  ocultar={totalEfectivo === 0}
                />
                <ResumenItem
                  label="Total a Depositar"
                  value={totalEfectivo}
                  ocultar={totalEfectivo === 0}
                />
              </div>

              {/* Detalle General */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Detalle General
                </p>
                {[
                  { label: "Total efectivo registrado", value: totalEfectivo },
                  {
                    label: "Total transferencias registradas",
                    value: totalTransferencias,
                  },
                  {
                    label: "Total facturas canceladas",
                    value: cierreSeleccionado.tot_compras_pag_cier ?? 0,
                  },
                  {
                    label: "Total gastos",
                    value: cierreSeleccionado.tot_gas_cier ?? 0,
                  },
                  {
                    label: "Diferencia",
                    value: diferenciaCalculada,
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-xs font-medium"
                  >
                    <span>{item.label}</span>
                    <span>
                      {totalEfectivo === 0
                        ? "$*.**"
                        : `$${item.value.toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Banco */}
              <div className="space-y-2">
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
                  <div className="flex flex-wrap items-center">
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
                  {movimientos.gastos.length > 0 ? (
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
            <Card className="flex-1 border border-border dark:bg-[#1a1a1a]">
              <CardHeader>
                <CardTitle>
                  <div className="flex flex-wrap items-center">
                    <ShoppingCart className="mr-2 h-4 w-4" /> Facturas
                    Canceladas
                  </div>
                </CardTitle>
              </CardHeader>

              {/* Scroll interno */}
              <ScrollArea className="h-[110px]">
                <CardContent className="space-y-2">
                  {/* Encabezados de la tabla */}
                  <div className="grid grid-cols-3 gap-4 border-border pb-2 text-xs font-semibold text-muted-foreground">
                    <span>Proveedor</span>
                    <span>Fecha</span>
                    <span className="text-right">Monto</span>
                  </div>

                  {/* Contenido dinámico */}
                  {movimientos.compras.length > 0 ? (
                    movimientos.compras.map((compra: any, index: number) => (
                      <div
                        key={index}
                        className="grid grid-cols-3 items-center gap-4 border border-x-transparent border-b-border border-t-transparent py-2 text-sm"
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
          <Card className="flex-1 border border-border dark:bg-[#1a1a1a]">
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
                <div className="grid grid-cols-4 gap-4 border-border pb-2 text-xs font-semibold text-muted-foreground">
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
                      className="grid grid-cols-4 items-center gap-4 border border-x-transparent border-b-border border-t-transparent py-2 text-sm"
                    >
                      <span>{venta.id_vent}</span>
                      <span>{venta.tip_pag_vent}</span>
                      <span>{venta.est_vent}</span>
                      <span
                        className={`text-right font-semibold ${
                          venta.tot_vent >= 0 ? "" : "text-red-600"
                        }`}
                      >
                        ${Number(venta.tot_vent ?? 0).toFixed(2)}
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
              <div className="flex flex-wrap items-center">
                <Receipt className="mr-2 h-4 w-4" /> Registrar Depósito
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Número de comprobante y valor */}
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

              <div className="flex-1 space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Valor del Depósito
                </label>
                <Input
                  type="number"
                  placeholder="Ej: 150.00"
                  value={valorDeposito}
                  onChange={(e) => setValorDeposito(e.target.value)}
                />
              </div>
            </div>

            {/* Imagen del comprobante */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Imagen del Comprobante
              </label>

              <label
                className="relative flex w-full flex-col items-center justify-center rounded-md border-2 border-dashed p-6 text-center hover:cursor-pointer hover:border-secondary dark:bg-[#1a1a1a]"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.add("border-secondary"); // opcional: highlight visual
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove("border-secondary"); // opcional: quitar highlight
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
                  <div className="flex h-[300px] items-center">
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
            </div>

            {/* Botón guardar */}
            <Button
              variant="secondary"
              className="w-full text-[12px] font-semibold"
              disabled={totalEfectivo === 0}
            >
              Guardar Depósito
            </Button>
          </CardContent>
        </Card>
      </div>
      <DialogNumeracionEfectivo
        open={openDialogNumeracion}
        onOpenChange={(open) => {
          if (!open) {
            setOpenDialogNumeracion(false);
          }
        }}
        onGuardar={(total) => {
          setFueGuardadoEfectivo(true);
          setTotalEfectivo(total);
          localStorage.setItem("totalEfectivo", total.toString());
          setOpenDialogNumeracion(false);
        }}
      />
    </ModulePageLayout>
  );
}

// Componentes auxiliares
function ResumenItem({
  label,
  value,
  ocultar = false,
}: {
  label: string;
  value: number | undefined;
  ocultar?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-4xl font-bold text-gray-900 dark:text-white">
        {ocultar
          ? "$*.**"
          : `$${Number(value ?? 0).toFixed(2)}
`}
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
