"use client";
import React, { useEffect, useState } from "react";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { Button } from "@/components/ui/button";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import {
  ArrowDownToLine,
  ArrowLeft,
  Mail,
  MapPinned,
  Pencil,
  Phone,
  Printer,
  User,
  Warehouse,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ICompra, IDetCompra } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToastError } from "@/components/shared/toast/toastError";
import { format, isValid, parse } from "date-fns";

export default function DetalleCompraPage() {
  useProtectedRoute();
  const router = useRouter();
  const { id_comp } = useParams();
  const purchaseId = Number(id_comp);
  const [compra, setCompra] = useState<ICompra | null>(null);
  const [detalleCompra, setDetalleCompra] = useState<IDetCompra[]>([]);
  const [esEditado, setEsEditado] = useState(false);
  const [esEditadoObservacion, setEsEditadoObservacion] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  /* Cargar detalle de la compra */
  useEffect(() => {
    async function fetchCompra() {
      setLoading(true);
      try {
        // Obtén la compra por su ID (ajusta la URL de la API según corresponda)
        const resCompra = await fetch(
          `http://localhost:5000/compras/${purchaseId}`,
        );
        if (!resCompra.ok) {
          throw new Error("Error al obtener los datos de la compra.");
        }
        const compraData = await resCompra.json();
        // Si la respuesta está envuelta, extraemos la propiedad data; de lo contrario, usamos la data directamente.
        const compraFinal = Array.isArray(compraData)
          ? compraData[0]
          : compraData.data || compraData;
        setCompra(compraFinal);

        // Para los detalles de compra usamos la URL especificada
        console.log("ID de compra:", purchaseId);
        const resDet = await fetch(
          `http://localhost:5000/detCompras/${purchaseId}`,
        );

        if (!resDet.ok) {
          throw new Error("Error al obtener los detalles de la compra.");
        }
        const detData = await resDet.json();
        console.log("Detalles de compra:", detData);
        // Se asume que el endpoint retorna un array de detalles
        const detArray = Array.isArray(detData) ? detData : detData.data || [];
        console.log("Detalles de compra procesados:", detArray);
        setDetalleCompra(detArray);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    if (purchaseId) {
      fetchCompra();
    }
  }, [purchaseId]);
  /* Regresar al listado de compras */
  const handleGoBack = () => {
    router.back();
  };
  const handleCambioObservacion = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const value = e.target.value;

    const palabras = value.trim().split(/\s+/).filter(Boolean);
    const cantidadActual = palabras.length;

    if (cantidadActual <= 50) {
      setCompra((prev) => prev && { ...prev, observ_comp: value });
    } else {
    }
  };

  /* Guardar observaciones */
  const handleGuardarObservacion = () => {
    setEsEditado(false);
  };

  if (loading) {
    return (
      <ModulePageLayout
        breadcrumbLinkTitle="Compras"
        breadcrumbPageTitle="Detalle de Compra"
        submenu={true}
        isLoading={true}
      >
        <div className="px-4 text-center md:px-6 lg:px-8">Cargando...</div>
      </ModulePageLayout>
    );
  }

  if (error || !compra) {
    return (
      <ModulePageLayout
        breadcrumbLinkTitle="Compras"
        breadcrumbPageTitle="Detalle de Compra"
        submenu={true}
        isLoading={false}
      >
        <div className="px-4 text-center md:px-6 lg:px-8">
          Ocurrió un error al cargar la compra.
        </div>
      </ModulePageLayout>
    );
  }
  const handleDescargarOrden = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/pdf/factura/${purchaseId}`,
      );
      if (!response.ok) throw new Error("Error al generar el PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Factura_${purchaseId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ Error al imprimir la factura:", error);
      alert("No se pudo generar el PDF. Inténtalo más tarde.");
    }
  };

  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Compras"
      breadcrumbPageTitle="Detalle de Compra"
      submenu={true}
      isLoading={false}
    >
      <div className="px-4 md:px-6 lg:px-8">
        {/* Flecha para regresar a la lista de compras */}
        <div className="mb-2 flex items-center gap-2 dark:text-gray-400">
          <ArrowLeft
            className="h-8 w-8 cursor-pointer"
            onClick={handleGoBack}
          />
        </div>

        {/* Encabezado principal con ID de la compra, fecha y estados */}
        <div className="mb-1 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Orden ID: #{compra.id_comp}
            </h1>
            <span
              className={`ml-5 rounded px-2 py-1 text-sm ${
                compra.estado_comp == "Pendiente"
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              }`}
            >
              Pago {compra.estado_comp}
            </span>

            <span
              className={`ml-3 rounded px-2 py-1 text-sm ${
                compra.estado_pag_comp === "pendiente"
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              }`}
            >
              {compra.estado_pag_comp}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              className="border-border text-[12px] font-semibold"
              variant="secondary"
              onClick={() => setEsEditado(true)}
            >
              <Pencil className="h-4 w-4" /> Editar
            </Button>

            <Button
              className="border-border text-[12px] font-semibold"
              variant="secondary"
              onClick={handleDescargarOrden}
            >
              <ArrowDownToLine className="h-4 w-4" /> Descargar
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-300">
          {new Date(compra.fech_comp).toLocaleString("es-ES", {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </p>

        {/* Contenedor principal de dos columnas */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Columna izquierda: Ítems, resumen, timeline */}
          <div className="space-y-4 md:col-span-2">
            <div className="h-auto rounded-md border border-border bg-white p-4 shadow-sm dark:bg-[#1a1a1a]">
              {/* Titulo de la card */}
              <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
                Artículos de la compra
              </h2>
              <ScrollArea className="max-h-[353px] w-full overflow-y-auto rounded-md">
                {/* Sección: Ítems o Productos en la compra */}
                {detalleCompra.length > 0 ? (
                  detalleCompra.map((item: IDetCompra) => (
                    <div key={item.id_dcom} className="p-4 shadow-sm">
                      <div className="flex items-start gap-4">
                        {/* Miniatura del producto */}
                        <div className="relative h-16 w-16 flex-shrink-0">
                          {typeof item.prod_dcom === "object" &&
                          item.prod_dcom.img_prod ? (
                            <Image
                              src={item.prod_dcom.img_prod}
                              alt={item.prod_dcom.nom_prod}
                              fill
                              className="rounded object-cover"
                            />
                          ) : (
                            <img
                              src="https://via.placeholder.com/80"
                              alt="Producto demo"
                              className="h-full w-full rounded object-cover"
                            />
                          )}
                        </div>

                        {/* Información principal (nombre del producto, descripción, variantes) */}
                        <div className="flex flex-col gap-1">
                          <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
                            {typeof item.prod_dcom === "object"
                              ? item.prod_dcom.nom_prod
                              : "Producto demo"}
                          </h2>
                          {/* define el label de la fecha de vencimiento */}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {item.fech_ven_prod_dcom
                              ? (() => {
                                  const parsed = parse(
                                    item.fech_ven_prod_dcom,
                                    "dd/MM/yyyy",
                                    new Date(),
                                  );
                                  return isValid(parsed)
                                    ? `Vence: ${format(parsed, "dd/MM/yyyy")}`
                                    : "Fecha inválida";
                                })()
                              : "Sin fecha de vencimiento"}
                          </span>

                          {/* Ejemplo de variantes o características del producto (como "Medium" / color) */}
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {item.prod_dcom.tip_prod} /{" "}
                              {item.prod_dcom.und_prod}
                            </span>
                          </div>
                        </div>

                        {/* Sección derecha: Cantidad, precio y botones de acción */}
                        <div className="ml-auto flex flex-col items-end gap-1">
                          {/* Cantidad x Precio unitario */}
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {item.cant_dcom} x $
                            {parseFloat(
                              item.prec_uni_dcom as unknown as string,
                            ).toFixed(2)}
                          </p>

                          {/* Subtotal (ej. 3 x 500 = 1500) */}
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            $
                            {parseFloat(
                              (item.cant_dcom *
                                item.prec_uni_dcom) as unknown as string,
                            ).toFixed(2)}
                          </p>

                          {/* Botones de acción */}
                          {/*  <div className="mt-2 flex gap-1">
                            <Button variant="secondary" className="text-xs">
                              Fulfill Item
                            </Button>
                            <Button variant="secondary" className="text-xs">
                              Create shipping label
                            </Button>
                          </div> */}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-900">
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                      No se encontraron ítems para esta compra.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Sección: Resumen de la compra */}
            <div className="rounded-md border border-border bg-white p-4 shadow-sm dark:bg-[#1a1a1a]">
              <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
                Resumen de la compra
              </h2>
              <div className="space-y-1 text-sm text-gray-700 dark:text-gray-200">
                <div className="flex items-center justify-between">
                  <span>Valor total:</span>
                  <span>${compra.tot_comp.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estado de pago:</span>
                  <span
                    className={`rounded px-2 py-1 text-sm ${
                      compra.estado_pag_comp.toLowerCase() === "pendiente"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    }`}
                  >
                    {compra.estado_pag_comp}
                  </span>
                </div>
                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                <div className="flex justify-end">
                  {/* Si el estado de la factura de es pendiente coloca el boton regstrar */}
                  {compra.estado_pag_comp.toLowerCase() === "pendiente" && (
                    <Button className="text-xs">Registrar pago</Button>
                  )}
                  {/* Si el estado de la factura de es pagada coloca el boton ver factura */}
                  {compra.estado_pag_comp.toLowerCase() === "pagada" && (
                    <Button className="text-xs">Ver factura</Button>
                  )}
                </div>
              </div>
            </div>

            {/* Sección: Timeline o notas internas */}
            {/* <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-900">
              <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
                Timeline
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Información sobre cambios, actualizaciones o eventos relevantes.
              </p>
            </div> */}
          </div>

          {/* Columna derecha */}
          <div className="space-y-4">
            <div className="rounded-md border border-border bg-white p-4 shadow-sm dark:bg-[#1a1a1a]">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-white">
                    Observaciones
                  </h3>
                  <Button
                    variant="ghost"
                    className="text-xs"
                    onClick={() => setEsEditadoObservacion((prev) => !prev)}
                    disabled={!esEditado}
                  >
                    <Pencil
                      className={`h-4 w-4 ${
                        esEditadoObservacion
                          ? "text-black dark:text-white"
                          : "text-[#9ba0a0]"
                      }`}
                    />
                  </Button>
                </div>
                {esEditadoObservacion ? (
                  <>
                    <>
                      <textarea
                        className="max-h-40 w-full resize-none overflow-y-auto break-all rounded-md border-none px-2 py-1 text-sm text-gray-800 focus:outline-none focus:ring-0 dark:bg-[#1a1a1a] dark:text-white"
                        value={compra.observ_comp || ""}
                        onChange={handleCambioObservacion}
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {compra.observ_comp?.trim().split(/\s+/).filter(Boolean)
                          .length || 0}{" "}
                        / 50 palabras
                      </p>
                    </>

                    <div className="flex justify-end">
                      {esEditadoObservacion && (
                        <Button
                          className="mt-2 text-xs"
                          onClick={handleGuardarObservacion}
                        >
                          Guardar
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="max-h-40 overflow-y-auto break-all text-sm text-gray-500 dark:text-gray-300">
                    {compra.observ_comp || "Sin observaciones."}
                  </p>
                )}
              </div>
            </div>
            {/* Informacion adicional */}
            <div className="rounded-md border border-border bg-white p-4 shadow-sm dark:bg-[#1a1a1a]">
              <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-white">
                Información adicional
              </h3>
              <div className="flex items-center gap-2">
                {typeof compra.usu_comp === "object" ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1">
                      {/* Informacion del empleado */}
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500 dark:text-gray-300">
                        {compra.usu_comp.nom_usu}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-gray-500 dark:text-gray-300">
                        <Mail className="h-4 w-4 text-gray-500" />
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-300">
                        {compra.usu_comp.email_usu}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Rol del usuario */

                  <span className="text-sm text-gray-500 dark:text-gray-300">
                    Empleado no disponible
                  </span>
                )}
              </div>
            </div>
            {/* Informacion del provedor */}
            <div className="rounded-md border border-border bg-white p-4 shadow-sm dark:bg-[#1a1a1a]">
              <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-white">
                Proveedor
              </h3>
              <div className="flex">
                {typeof compra.prov_comp === "object" ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1">
                      {/* Informacion del proveedor */}
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500 dark:text-gray-300">
                        {compra.prov_comp.nom_prov}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-gray-500 dark:text-gray-300">
                        <Mail className="h-4 w-4 text-gray-500" />
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-300">
                        {compra.prov_comp.email_prov}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-gray-500 dark:text-gray-300">
                        <MapPinned className="h-4 w-4 text-gray-500" />
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-300">
                        {compra.prov_comp.direc_prov}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-gray-500 dark:text-gray-300">
                        <Phone className="h-4 w-4 text-gray-500" />
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-300">
                        {compra.prov_comp.tel_prov}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Rol del usuario */

                  <span className="text-sm text-gray-500 dark:text-gray-300">
                    Proveedor no disponible
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModulePageLayout>
  );
}
