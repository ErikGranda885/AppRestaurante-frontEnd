"use client";
import React, { useEffect, useState } from "react";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { Button } from "@/components/ui/button";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { ArrowLeft, Pencil, Printer } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ICompra, IDetCompra } from "@/lib/types";

export default function DetalleCompraPage() {
  useProtectedRoute();
  const router = useRouter();
  const { id_comp } = useParams();
  const purchaseId = Number(id_comp);
  const [compra, setCompra] = useState<ICompra | null>(null);
  const [detalleCompra, setDetalleCompra] = useState<IDetCompra[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

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

  const handleGoBack = () => {
    router.back();
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
            >
              <Pencil className="h-4 w-4" /> Editar
            </Button>

            <Button
              className="border-border text-[12px] font-semibold"
              variant="secondary"
            >
              <Printer className="h-4 w-4" /> Imprimir
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
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Columna izquierda: Ítems, resumen, timeline */}
          <div className="space-y-4 md:col-span-2">
            {/* Sección: Ítems o Productos en la compra */}
            {detalleCompra.length > 0 ? (
              detalleCompra.map((item: IDetCompra) => (
                <div
                  key={item.id_dcom}
                  className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-900"
                >
                  {/* Encabezado / etiqueta, por si quieres mostrar estado (Por ejemplo: "Unfulfilled") */}
                  <div className="mb-2 text-xs font-medium text-red-500 dark:text-red-300">
                    Unfulfilled
                  </div>

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
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Use this personalized guide to get your store up and
                        running
                      </p>

                      {/* Ejemplo de variantes o características del producto (como "Medium" / color) */}
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Medium
                        </span>
                        <div className="h-3 w-3 rounded-full bg-black" />
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
                      <div className="mt-2 flex gap-1">
                        <Button variant="secondary" className="text-xs">
                          Fulfill Item
                        </Button>
                        <Button variant="secondary" className="text-xs">
                          Create shipping label
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-900">
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  No se encontraron ítems para esta compra.
                </p>
              </div>
            )}

            {/* Sección: Resumen de la compra */}
            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-900">
              <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
                Order Summary
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
                  <button className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                    Edit payment
                  </button>
                </div>
              </div>
            </div>

            {/* Sección: Timeline o notas internas */}
            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-900">
              <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
                Timeline
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Información sobre cambios, actualizaciones o eventos relevantes.
              </p>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-4">
            {/* Notas */}
            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-900">
              <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-white">
                Notas
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Aquí puedes agregar notas internas sobre esta compra.
              </p>
            </div>

            {/* Shipping Address */}
            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-900">
              <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-white">
                Shipping address
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Dirección demo <br />
                Ciudad / País <br />
                Teléfono: +1 234 567 890
              </p>
            </div>

            {/* Billing Address */}
            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-900">
              <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-white">
                Billing address
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {typeof compra.prov_comp === "object"
                  ? compra.prov_comp.nom_prov
                  : `Proveedor ID: ${compra.prov_comp}`}
                <br />
                {/* Agregar datos adicionales */}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModulePageLayout>
  );
}
