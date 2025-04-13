pero manten este diseño "use client";
import React, { useEffect, useState } from "react";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { Button } from "@/components/ui/button";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { ArrowLeft, Pencil, Printer } from "lucide-react";
import { ICompra } from "@/lib/types";

export default function Page() {
  useProtectedRoute();

  const [compra, setCompra] = useState<ICompra | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCompra() {
      try {
        // Reemplaza la URL con el endpoint real de tu API.
        const response = await fetch("http://localhost:5000/detCompras/4");
        if (!response.ok) {
          throw new Error("Error al obtener los datos de la compra.");
        }
        const data: ICompra = await response.json();
        console.log(data);
        setCompra(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchCompra();
  }, []);

  if (loading) {
    return (
      <ModulePageLayout
        breadcrumbLinkTitle="Compras"
        breadcrumbPageTitle="Orden de compra detallada"
        submenu={true}
        isLoading={true}
      >
        <div className="px-4 md:px-6 lg:px-8">Cargando...</div>
      </ModulePageLayout>
    );
  }

  if (error || !compra) {
    return (
      <ModulePageLayout
        breadcrumbLinkTitle="Compras"
        breadcrumbPageTitle="Orden de compra detallada"
        submenu={true}
        isLoading={false}
      >
        <div className="px-4 md:px-6 lg:px-8">
          Ocurrió un error al cargar la compra.
        </div>
      </ModulePageLayout>
    );
  }

  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Compras"
      breadcrumbPageTitle="Orden de compra detallada"
      submenu={true}
      isLoading={false}
    >
      <div className="px-4 md:px-6 lg:px-8">
        {/* Flecha para regresar a la lista de compras */}
        <div className="mb-5 flex items-center gap-2 dark:text-gray-400">
          <ArrowLeft
            className="h-8 w-8 cursor-pointer"
            onClick={() => window.history.back()}
          />
        </div>

        {/* Encabezado principal con ID de la compra, fecha y estado */}
        <div className="mb-1 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Orden ID: #{compra.id_comp}.
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
          {/* Columna izquierda (dos columnas en pantallas grandes) */}
          <div className="space-y-4 md:col-span-2">
            {/* Sección: Ítems o Productos en la compra */}
            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-900">
              <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
                Orden Item
              </h2>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <img
                    src="https://via.placeholder.com/80"
                    alt="Producto demo"
                    className="h-20 w-20 rounded object-cover"
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">
                      Macbook Air
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-300">
                      Guía para arrancar y poner en funcionamiento tu nuevo Mac
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    $2,500.00
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-300">
                    Cantidad: 1
                  </p>
                </div>
              </div>
            </div>

            {/* Sección: Resumen de la compra */}
            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-900">
              <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
                Order Summary
              </h2>
              <div className="space-y-1 text-sm text-gray-700 dark:text-gray-200">
                <div className="flex items-center justify-between">
                  <span>Valor total:</span>
                  <span>${compra.tot_comp}</span>
                </div>
                {/* Si hay costos adicionales, descuentos, etc. */}
                <div className="flex items-center justify-between">
                  <span>Estado de pago:</span>
                  <span
                    className={`rounded px-2 py-1 text-sm ${
                      compra.estado_pag_comp === "pendiente"
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
                Muestra aquí información sobre cambios, actualizaciones o eventos
                relevantes de la compra.
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

            {/* Información de envío */}
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

            {/* Facturación o Contacto */}
            <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-900">
              <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-white">
                Billing address
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {} <br />
                {/* Agregar más datos: RUC, dirección de facturación, etc. */}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModulePageLayout>
  );
}
