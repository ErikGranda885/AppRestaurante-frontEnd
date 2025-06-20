"use client";
import React, { useEffect } from "react";
import { FormProvider } from "react-hook-form";
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
import { CampoNumero } from "@/components/shared/varios/campoNumero";
import { CampoFecha } from "@/components/shared/compras/ui/campoFecha";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import FacturaModal from "@/components/shared/compras/ui/ordenModal";
import { TIPO_DOCUMENTO_OPTIONS } from "@/lib/constants";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { useReactToPrint } from "react-to-print";
import { GeneralDialog } from "@/components/shared/varios/dialogGen";
import { safePrice } from "@/utils/format";
import { CampoSelectEquivalencia } from "@/components/shared/compras/ui/campoEquivalencias";
import { validarEquivalenciaActiva } from "@/hooks/compras/validarEquivalenciaActiva";
import { CampoProductoCompra } from "@/components/shared/compras/ui/campoProductoCompras";
import { useNuevaCompra } from "@/hooks/compras/useNuevaCompra";
import { SERVICIOS_COMPRAS } from "@/services/compras.service";
import { socket } from "@/lib/socket";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export interface ProductoOption {
  value: string;
  nombre: string;
  cod_prod: number;
  img_prod: string;
  tipo: string;
}

export default function NuevaCompraPage() {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    methods,
    router,
    proveedores,
    productosOptions,
    setProductosOptions,
    usuarioActual,
    ultimoIdCompra,
    productos,
    setProductos,
    bloquearAñadirFila,
    setBloquearAñadirFila,
    openFactura,
    setOpenFactura,
    compraPreview,
    setCompraPreview,
    contentRef,
    openConfirmDialog,
    setOpenConfirmDialog,
    calcularEstadoLote,
    ventasConfig,
    esInsumo,
  } = useNuevaCompra();

  const DIAS_UMBRAL_POR_VENCER = 30;

  const productoSeleccionado = watch("producto");
  const cantidad = watch("cant_dcom");
  const precioUnitario = watch("prec_uni_dcom");
  const fechaVencimiento = watch("fech_ven_prod_dcom");

  useEffect(() => {
    methods.register("dias_credito");
  }, [methods]);

  useEffect(() => {
    const productoSeleccionado = productosOptions.find(
      (p) => p.value === watch("producto"),
    );

    if (!productoSeleccionado) return;

    validarEquivalenciaActiva(
      Number(productoSeleccionado.cod_prod),
      productoSeleccionado.tipo,
      setBloquearAñadirFila,
      (unidad) => setValue("equivalenciaSeleccionada", unidad),
    );
  }, [watch("producto"), productosOptions, setValue]);

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

    const startTime = performance.now(); // ⏱️ Inicio

    try {
      const resCompra = await fetch(SERVICIOS_COMPRAS.compras, {
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
          fech_ven_prod_dcom: item.fech_ven_prod_dcom || null,
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

      const endTime = performance.now(); // ⏱️ Fin
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      socket.emit("compras-actualizadas");
      setOpenFactura(false);
      ToastSuccess({
        message: `Compra registrada exitosamente en ${duration} segundos.`,
      });

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
        id_usu: usuarioActual.usuario!.id_usu,
        nom_usu: usuarioActual.usuario!.nom_usu,
        email_usu: usuarioActual.usuario!.email_usu,
      } as IUsuario,

      tipo_doc_comp: tipoDocumentoSeleccionado?.label || "Factura",
      num_doc_comp: formData.num_doc_comp,
      form_pag_comp: formData.forma_pago_comp,
      dias_credito:
        formData.forma_pago_comp === "credito"
          ? Number(formData.dias_credito)
          : null,
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
          <div className="mt-2">
            <div className="mb-2 flex items-center">
              <ShoppingBag className="mr-2 h-4 w-4" />
              <h3 className="font-semibold">Detalle de la venta</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-6">
              <div className="col-span-1">
                <CampoProveedor
                  control={control}
                  name="proveedor"
                  label="Proveedor"
                />
              </div>

              <div className="col-span-1">
                <CampoTipoDocumento
                  control={control}
                  name="tipo_doc_comp"
                  label="Tipo de documento"
                />
              </div>

              <div className="col-span-1">
                <CampoTexto
                  control={control}
                  name="num_doc_comp"
                  placeholder="Ingresa el número de la factura"
                  label="Número de documento"
                />
              </div>

              <div className="col-span-1">
                <CampoFormaPago
                  control={control}
                  name="forma_pago_comp"
                  label="Forma de pago"
                />
              </div>

              {watch("forma_pago_comp") === "credito" ? (
                <>
                  <div className="col-span-1">
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Días de crédito
                    </label>
                    <Select
                      name="dias_credito"
                      value={String(watch("dias_credito") ?? "")}
                      onValueChange={(value) => setValue("dias_credito", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona días de crédito" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 30 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1} días
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <CampoTextArea
                      control={control}
                      name="observ_comp"
                      label="Observaciones"
                      placeholder="Escriba alguna observación relevante"
                    />
                  </div>
                </>
              ) : (
                <div className="col-span-2">
                  <CampoTextArea
                    control={control}
                    name="observ_comp"
                    label="Observaciones"
                    placeholder="Escriba alguna observación relevante"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Detalle de productos */}
          <div className="w-full">
            <div className="mb-2 flex flex-wrap items-center">
              <Box className="mr-2 h-4 w-4" />
              <h3 className="font-semibold">Detalle de productos</h3>
            </div>

            <div className="flex w-full flex-wrap items-end gap-4 xl:flex-nowrap">
              {(() => {
                const producto = productosOptions.find(
                  (p) => p.value === watch("producto"),
                );
                const esInsumo = producto?.tipo === "Insumo";

                return (
                  <>
                    <div className={esInsumo ? "w-[45%]" : "w-[80%]"}>
                      <CampoProductoCompra
                        control={control}
                        setValue={setValue}
                        name="producto"
                        label="Producto"
                        options={productosOptions}
                        setOptions={setProductosOptions}
                        onValidarEquivalencia={(producto) =>
                          validarEquivalenciaActiva(
                            producto.cod_prod,
                            producto.tipo ?? "",
                            setBloquearAñadirFila,
                            (unidad) =>
                              setValue("equivalenciaSeleccionada", unidad),
                          )
                        }
                      />
                    </div>

                    {esInsumo && (
                      <div className="w-[35%]">
                        <CampoSelectEquivalencia
                          control={control}
                          name="equivalenciaSeleccionada"
                          label="Equivalencia"
                          productoId={parseInt(producto.value)}
                        />
                      </div>
                    )}
                  </>
                );
              })()}

              <div className="w-[120px]">
                <CampoNumero
                  control={control}
                  name="cant_dcom"
                  label="Cantidad"
                />
              </div>

              <div className="w-[150px]">
                <CampoNumero
                  control={control}
                  name="prec_uni_dcom"
                  label={esInsumo ? "Precio de compra" : "Precio Unitario"}
                />
              </div>

              <div className="w-[200px]">
                <CampoFecha
                  control={control}
                  name="fech_ven_prod_dcom"
                  label="Fecha de vencimiento"
                />
              </div>

              <div className="mt-4">
                <Button
                  type="button"
                  variant="primary"
                  onClick={agregarDetalleProducto}
                  disabled={bloquearAñadirFila}
                >
                  + Añadir fila
                </Button>
              </div>
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
                    <th className="p-2">Precio</th>
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
                      <td className="p-2">
                        {safePrice(item.prec_uni_dcom, ventasConfig.moneda)}
                      </td>
                      <td className="p-2">
                        {safePrice(
                          item.prec_uni_dcom * item.cant_dcom,
                          ventasConfig.moneda,
                        )}
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
                  {safePrice(totalCompra, ventasConfig.moneda)}
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
