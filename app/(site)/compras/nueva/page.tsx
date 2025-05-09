"use client";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { ICompra, IDetCompra, IProduct, IUsuario } from "@/lib/types";
import { CampoProveedor } from "@/components/shared/compras/ui/campoProveedor";
import { ToastError } from "@/components/shared/toast/toastError";
import { Button } from "@/components/ui/button";
import { CampoTipoDocumento } from "@/components/shared/compras/ui/campoTipoDocumento";
import { CampoFormaPago } from "@/components/shared/compras/ui/campoFormaPago";
import { CampoTexto } from "@/components/shared/varios/campoTexto";
import { CampoTextArea } from "@/components/shared/compras/ui/campoTextArea";
import { ArrowLeft, Box, ShoppingBag, Trash2 } from "lucide-react";
import { CampoProducto } from "@/components/shared/compras/ui/campoProducto";
import { CampoNumero } from "@/components/shared/varios/campoNumero";
import { CampoFecha } from "@/components/shared/compras/ui/campoFecha";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import FacturaModal from "@/components/shared/compras/ui/ordenModal";
import { TIPO_DOCUMENTO_OPTIONS } from "@/lib/constants";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";
import { GeneralDialog } from "@/components/shared/varios/dialogGen";
import { useProveedores } from "@/hooks/compras/useProveedores";
import { useProductos } from "@/hooks/compras/useProductos";
import { useUsuarioActual } from "@/hooks/compras/useUsuarioActual";
import { useUltimoIdCompra } from "@/hooks/compras/useUltimoIdCompra";
export interface ProductoOption {
  value: string;
  nombre: string;
  cod_prod: number;
  img_prod: string;
}
const schema = z.object({
  proveedor: z.string().min(1, "Seleccione un proveedor"),
  tipo_doc_comp: z.string().min(1, "Seleccione un tipo de documento"),
  num_doc_comp: z.string().min(1, "Ingrese el número de documento"),
  forma_pago_comp: z.string().min(1, "Seleccione la forma de pago"),
  observ_comp: z.string().optional(),
  producto: z.string().nullable().optional(),
  cant_dcom: z.number().nullable().optional(),
  prec_uni_dcom: z.number().nullable().optional(),
  fech_ven_prod_dcom: z.string().nullable().optional(),
});

export default function NuevaCompraPage() {
  const router = useRouter();
  const proveedores = useProveedores();
  const { productosOptions, setProductosOptions } = useProductos();
  const usuarioActual = useUsuarioActual();
  const ultimoIdCompra = useUltimoIdCompra();
  const [productos, setProductos] = useState<IDetCompra[]>([]);
  const [openFactura, setOpenFactura] = useState(false);
  const [compraPreview, setCompraPreview] = useState<any | null>(null);
  const DIAS_UMBRAL_POR_VENCER = 30;
  const contentRef = useRef<HTMLDivElement>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const methods = useForm({
    defaultValues: {
      proveedor: "",
      tipo_doc_comp: "",
      num_doc_comp: "",
      forma_pago_comp: "",
      producto: "",
      cant_dcom: 1,
      prec_uni_dcom: 0,
      fech_ven_prod_dcom: null,
    },
    resolver: zodResolver(schema),
  });
  const { control, handleSubmit, watch, setValue } = methods;
  const productoSeleccionado = watch("producto");
  const cantidad = watch("cant_dcom");
  const precioUnitario = watch("prec_uni_dcom");
  const fechaVencimiento = watch("fech_ven_prod_dcom");

  const handleImprimir = useReactToPrint({ contentRef });

  const handleConfirmarYImprimir = async () => {
    setOpenConfirmDialog(true);
  };

  const handleDialogConfirm = async (guardarPDF: boolean) => {
    setOpenConfirmDialog(false);

    if (guardarPDF && contentRef.current) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await handleImprimir();
    }

    await handleConfirmarCompra();
  };

  function calcularEstadoLote(
    fechaVencimiento: string | null,
    diasPorVencer = 30,
  ): "vigente" | "por_vencer" | "vencido" {
    if (!fechaVencimiento) return "vigente";

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // eliminar hora

    const vencimiento = new Date(fechaVencimiento);
    vencimiento.setHours(0, 0, 0, 0); // eliminar hora

    const diferenciaDias = Math.floor(
      (vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diferenciaDias < 0) return "vencido";
    if (diferenciaDias <= diasPorVencer) return "por_vencer";
    return "vigente";
  }

  /* Agregar producto al detalle */
  const agregarDetalleProducto = () => {
    if (!productoSeleccionado || !cantidad || !precioUnitario) {
      ToastError({ message: "Completa los campos para añadir un producto." });
      return;
    }

    const productoCompleto = productosOptions.find(
      (p) => p.value === productoSeleccionado,
    );

    if (!productoCompleto) {
      ToastError({ message: "Producto no encontrado." });
      return;
    }

    const idProducto = Number(productoCompleto.value);
    const nuevaCantidad = Number(cantidad);
    const nuevoPrecio = Number(String(precioUnitario).replace(",", "."));

    const fecha = fechaVencimiento ? fechaVencimiento : null;

    const loteGenerado = `L${Date.now()}`; // Podrías usar un generador más sofisticado si deseas

    setProductos((prev) => {
      const indexExistente = prev.findIndex(
        (item) => item.prod_dcom.id_prod === idProducto,
      );

      if (indexExistente !== -1) {
        const productosActualizados = [...prev];
        const productoExistente = productosActualizados[indexExistente];

        productoExistente.cant_dcom += nuevaCantidad;
        productoExistente.sub_tot_dcom =
          productoExistente.cant_dcom * nuevoPrecio;
        productoExistente.prec_uni_dcom = nuevoPrecio;
        productoExistente.fech_ven_prod_dcom = fecha;

        // Actualizar campos automáticos
        productoExistente.cant_disponible_dcom =
          (productoExistente.cant_disponible_dcom || 0) + nuevaCantidad;
        productoExistente.est_lote_dcom = "Activo";

        return productosActualizados;
      } else {
        const estadoLote = calcularEstadoLote(
          fechaVencimiento ?? null,
          DIAS_UMBRAL_POR_VENCER,
        );

        // ← aquí defines el umbral
        const nuevoDetalle: IDetCompra = {
          id_dcom: Date.now(),
          comp_dcom: {} as any,
          prod_dcom: {
            id_prod: idProducto,
            nom_prod: productoCompleto.nombre,
            img_prod: productoCompleto.img_prod,
          } as IProduct,
          cant_dcom: nuevaCantidad,
          prec_uni_dcom: nuevoPrecio,
          sub_tot_dcom: nuevaCantidad * nuevoPrecio,
          fech_ven_prod_dcom: fecha,
          lote_dcom: loteGenerado,
          cant_usada_dcom: 0,
          cant_disponible_dcom: nuevaCantidad,
          est_lote_dcom: estadoLote,
        };

        return [...prev, nuevoDetalle];
      }
    });

    // Reset campos
    setValue("producto", "");
    setValue("cant_dcom", 1);
    setValue("prec_uni_dcom", 0);
    setValue("fech_ven_prod_dcom", null);

    methods.unregister("producto");
    methods.unregister("cant_dcom");
    methods.unregister("prec_uni_dcom");
    methods.unregister("fech_ven_prod_dcom");

    methods.clearErrors([
      "producto",
      "cant_dcom",
      "prec_uni_dcom",
      "fech_ven_prod_dcom",
    ]);
  };

  /* Regresar al listado de compras */
  const handleGoBack = () => {
    router.back();
  };
  /* Confirmar la compra */
  const handleConfirmarCompra = async () => {
    if (!compraPreview) return;

    try {
      const resCompra = await fetch("http://localhost:5000/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...compraPreview,
          prov_comp: compraPreview.prov_comp.id_prov,
          usu_comp: compraPreview.usu_comp.id_usu,
          id_comp: undefined,
          crea_en_comp: undefined,
          act_en_comp: undefined,
        }),
      });

      if (!resCompra.ok) {
        const errorData = await resCompra.json();
        throw new Error(errorData.message || "Error al registrar la compra");
      }

      const compraGuardada = await resCompra.json();
      const idCompra = compraGuardada.id_comp;

      for (const item of productos) {
        const detalle = {
          comp_dcom: idCompra,
          prod_dcom: item.prod_dcom.id_prod,
          cant_dcom: item.cant_dcom,
          prec_uni_dcom: item.prec_uni_dcom,
          sub_tot_dcom: item.sub_tot_dcom,
          fech_ven_prod_dcom: item.fech_ven_prod_dcom
            ? format(new Date(item.fech_ven_prod_dcom), "yyyy-MM-dd")
            : null,
          lote_dcom: item.lote_dcom,
          cant_usada_dcom: item.cant_usada_dcom,
          cant_disponible_dcom: item.cant_disponible_dcom,
          est_lote_dcom: item.est_lote_dcom,
        };

        try {
          const resDetalle = await fetch("http://localhost:5000/dets-compras", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(detalle),
          });

          if (!resDetalle.ok) {
            const err = await resDetalle.json();
            throw new Error(
              err.message || "Error desconocido al guardar el detalle",
            );
          }
        } catch (error: any) {
          await fetch(`http://localhost:5000/compras/${idCompra}`, {
            method: "DELETE",
          });

          ToastError({
            message: `Detalle no registrado (${item.prod_dcom.nom_prod}): ${error.message}`,
          });

          throw new Error("Se canceló la compra por error en el detalle.");
        }
      }

      setOpenFactura(false);
      ToastSuccess({ message: "Compra registrada exitosamente" });
      router.push("/compras/historial");
    } catch (error: any) {
      ToastError({
        message: error.message || "Error al registrar la compra",
      });
    }
  };

  /* Ttoal de productos */
  const totalCompra = productos.reduce(
    (acc, item) => acc + item.prec_uni_dcom * item.cant_dcom,
    0,
  );

  const onSubmit = async (formData: any) => {
    if (!usuarioActual) {
      ToastError({ message: "No se encontró usuario válido." });
      return;
    }

    const proveedorSeleccionado = proveedores.find(
      (p) => p.value === formData.proveedor,
    );

    const tipoDocumentoSeleccionado = TIPO_DOCUMENTO_OPTIONS.find(
      (doc) => doc.value === formData.tipo_doc_comp,
    );

    if (!proveedorSeleccionado || productos.length === 0) {
      ToastError({
        message: "Complete el formulario y agregue al menos un producto.",
      });
      return;
    }

    const compra: ICompra = {
      id_comp: ultimoIdCompra + 1,
      tot_comp: productos.reduce(
        (acc, item) => acc + item.prec_uni_dcom * item.cant_dcom,
        0,
      ),
      prov_comp: {
        id_prov: Number(formData.proveedor),
        nom_prov: proveedorSeleccionado.nombre,
        ruc_prov: proveedorSeleccionado.ruc,
        est_prov: "activo",
        cont_prov: proveedorSeleccionado.contacto ?? "",
        tel_prov: proveedorSeleccionado.telefono ?? "",
        direc_prov: proveedorSeleccionado.direccion ?? "",
        email_prov: proveedorSeleccionado.correo ?? "",
        img_prov: proveedorSeleccionado.imagen ?? "",
      },
      usu_comp: {
        id_usu: usuarioActual.id_usu,
        nom_usu: usuarioActual.nom_usu,
        email_usu: usuarioActual.email_usu,
      } as IUsuario,
      tipo_doc_comp: tipoDocumentoSeleccionado?.label || "Factura",
      num_doc_comp: formData.num_doc_comp,
      form_pag_comp: formData.forma_pago_comp,
      fech_comp: new Date().toISOString(),
      fech_venc_comp: new Date().toISOString(),
      estado_comp: "pendiente",
      estado_pag_comp: "pendiente",
      crea_en_comp: new Date(),
      act_en_comp: new Date(),
      observ_comp: formData.observ_comp,
    };

    try {
      // ⚠️ Solo guardamos datos en memoria (no registramos aún)
      setCompraPreview({ ...compra });
      setOpenFactura(true); // muestra el modal de previsualización
    } catch (error: any) {
      ToastError({
        message: error.message || "Error al preparar la compra.",
      });
    }
  };

  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Compras"
      breadcrumbPageTitle="Nueva Compra"
      submenu={true}
    >
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 p-4"
        >
          {/* Título */}
          <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ArrowLeft
                className="h-8 w-8 cursor-pointer"
                onClick={handleGoBack}
              />
              <div>
                <h1 className="text-xl font-bold">Nueva Compra</h1>
                <p className="text-sm text-muted-foreground">
                  Complete los campos para crear una nueva compra.
                </p>
              </div>
            </div>
          </div>

          {/* Detalle del vendedor */}
          <div className="mt-2 w-full">
            <div className="mb-2 flex items-center">
              <ShoppingBag className="mr-2 h-4 w-4" />
              <h3 className="font-semibold">Detalle de la venta</h3>
            </div>

            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
              <CampoProveedor
                control={control}
                name="proveedor"
                label="Proveedor"
                options={proveedores}
              />
              <CampoTipoDocumento
                control={control}
                name="tipo_doc_comp"
                label="Tipo de documento"
              />
              <CampoTexto
                control={control}
                name="num_doc_comp"
                placeholder="Ingresa el número de la factura"
                label="Número de documento"
              />
              <CampoFormaPago
                control={control}
                name="forma_pago_comp"
                label="Forma de pago"
              />
              <CampoTextArea
                control={control}
                name="observ_comp"
                label="Observaciones"
                placeholder="Escriba alguna observación relevante"
              />
            </div>
          </div>

          {/* Detalle de productos */}
          <div className="w-full">
            <div className="mb-2 flex flex-wrap items-center">
              <Box className="mr-2 h-4 w-4" />
              <h3 className="font-semibold">Detalle de productos</h3>
            </div>

            <div className="flex flex-wrap items-end gap-6">
              <div className="min-w-[220px] flex-1">
                <CampoProducto
                  control={control}
                  setValue={setValue} // ✅ esto es lo que está faltando
                  name="producto"
                  label="Producto"
                  options={productosOptions}
                  setOptions={setProductosOptions}
                />
              </div>

              <CampoNumero
                control={control}
                name="cant_dcom"
                label="Cantidad"
              />

              <CampoNumero
                control={control}
                name="prec_uni_dcom"
                label="Precio Unitario"
              />

              <CampoFecha
                control={control}
                name="fech_ven_prod_dcom"
                label="Fecha de vencimiento"
              />

              <Button
                type="button"
                variant="primary"
                onClick={agregarDetalleProducto}
              >
                + Añadir fila
              </Button>
            </div>
          </div>

          {/* Tabla de productos de compra */}
          <div className="overflow-hidden rounded-md border border-border">
            <ScrollArea className="max-h-[258px] overflow-y-auto">
              <table className="w-full table-auto text-sm">
                <thead className="sticky top-0 z-10 bg-white shadow-sm dark:bg-black">
                  <tr>
                    <th className="p-2 text-start">Producto</th>
                    <th className="p-2">Cantidad</th>
                    <th className="p-2">Precio Unitario</th>
                    <th className="p-2">Subtotal</th>
                    <th className="p-2">Fecha venc.</th>
                    <th className="p-2">Eliminar</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((item, index) => (
                    <motion.tr
                      key={item.id_dcom}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border border-border text-center"
                    >
                      <td className="p-2">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <Image
                              src={item.prod_dcom.img_prod}
                              alt={item.prod_dcom.nom_prod}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          </div>
                          <div className="flex flex-col justify-center text-left leading-tight">
                            <span className="text-sm font-medium">
                              {item.prod_dcom.nom_prod}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Código: {item.prod_dcom.id_prod}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-2">{item.cant_dcom}</td>
                      <td className="p-2">${item.prec_uni_dcom.toFixed(2)}</td>
                      <td className="p-2">
                        ${(item.prec_uni_dcom * item.cant_dcom).toFixed(2)}
                      </td>
                      <td className="p-2">
                        {item.fech_ven_prod_dcom
                          ? new Date(
                              item.fech_ven_prod_dcom,
                            ).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setProductos((prev) =>
                              prev.filter((_, i) => i !== index),
                            )
                          }
                        >
                          <Trash2 className="error-text h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>

            {/* Total */}
            <div className="flex justify-end rounded-b-md border-border bg-muted px-4 py-2">
              <p className="text-sm font-semibold">
                Total:{" "}
                <span className="text-base text-foreground">
                  ${totalCompra.toFixed(2)}
                </span>
              </p>
            </div>
          </div>

          {/* Botón guardar */}
          <div className="flex flex-col items-end gap-2">
            <Button
              type="submit"
              disabled={productos.length === 0}
              className="disabled:cursor-not-allowed disabled:opacity-50"
            >
              Guardar compra
            </Button>
          </div>
        </form>

        {/* Modal de previsualización */}
        {compraPreview && (
          <FacturaModal
            open={openFactura}
            onClose={() => setOpenFactura(false)}
            compra={compraPreview}
            detalle={productos}
            onConfirm={handleConfirmarYImprimir}
            printRef={contentRef}
          />
        )}
      </FormProvider>
      <GeneralDialog
        open={openConfirmDialog}
        onOpenChange={setOpenConfirmDialog}
        title="¿Desea guardar una copia en PDF de esta orden?"
        contentWidth="400px"
      >
        <div className="flex justify-end gap-4">
          <Button
            variant="secondary"
            onClick={() => handleDialogConfirm(false)}
          >
            No
          </Button>
          <Button variant="primary" onClick={() => handleDialogConfirm(true)}>
            Sí
          </Button>
        </div>
      </GeneralDialog>
    </ModulePageLayout>
  );
}
