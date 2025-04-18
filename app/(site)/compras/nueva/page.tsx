"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { ICompra, IDetCompra, IProduct, IProveedor } from "@/lib/types";
import {
  CampoProveedor,
  ProveedorOption,
} from "@/components/shared/compras/ui/campoProveedor";
import { ToastError } from "@/components/shared/toast/toastError";
import { Button } from "@/components/ui/button";
import { SERVICIOS } from "@/services/proveedores.service";
import { CampoTipoDocumento } from "@/components/shared/compras/ui/campoTipoDocumento";
import { CampoFormaPago } from "@/components/shared/compras/ui/campoFormaPago";
import { CampoTexto } from "@/components/shared/varios/campoTexto";
import { CampoTextArea } from "@/components/shared/compras/ui/campoTextArea";
import { ArrowLeft, Box, ShoppingBag, Trash2, User } from "lucide-react";
import { CampoProducto } from "@/components/shared/compras/ui/campoProducto";
import { SERVICIOS_PRODUCTOS } from "@/services/productos.service";
import { CampoNumero } from "@/components/shared/varios/campoNumero";
import { CampoFecha } from "@/components/shared/compras/ui/campoFecha";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
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
  producto: z.string().min(1, "Seleccione un producto"),
  cant_dcom: z.number().min(1, "Ingrese una cantidad válida (mayor a 0)"),
  prec_uni_dcom: z.number().min(0.01, "El precio debe ser mayor a 0"),
  fech_ven_prod_dcom: z.string().nullable().optional(),
});

export default function NuevaCompraPage() {
  const router = useRouter();
  const [productos, setProductos] = useState<IDetCompra[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorOption[]>([]);
  const [productosOptions, setProductosOptions] = useState<ProductoOption[]>(
    [],
  );

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

  /* Cargar Proveedores */
  useEffect(() => {
    fetch(SERVICIOS.proveedores)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar proveedores");
        return res.json();
      })
      .then((data: IProveedor[]) => {
        const activos = data.filter(
          (prov) => prov.est_prov?.toLowerCase() === "activo",
        );

        const opciones: ProveedorOption[] = activos.map((prov) => ({
          value: prov.id_prov.toString(),
          label: `${prov.nom_prov} - ${prov.ruc_prov}`,
          nombre: prov.nom_prov,
          ruc: prov.ruc_prov,
        }));

        setProveedores(opciones);
      })
      .catch((err) => {
        console.error("Error al cargar proveedores:", err);
        ToastError({ message: "Error al cargar proveedores" + err.message });
      });
  }, []);

  /* Cargar Productos */
  useEffect(() => {
    fetch(SERVICIOS_PRODUCTOS.productos)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar productos");
        return res.json();
      })
      .then((data: IProduct[]) => {
        const activos = data.filter(
          (prod) => prod.est_prod?.toLowerCase() === "activo",
        );

        const opciones: ProductoOption[] = activos.map((prod) => ({
          value: prod.id_prod.toString(),
          nombre: prod.nom_prod,
          cod_prod: prod.id_prod,
          img_prod: prod.img_prod,
        }));

        setProductosOptions(opciones);
      })
      .catch((err) => {
        console.error("Error al cargar productos:", err);
        ToastError({ message: "Error al cargar productos: " + err.message });
      });
  }, []);

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
    const nuevoPrecio = Number(precioUnitario);
    const fecha = fechaVencimiento
      ? new Date(fechaVencimiento).toISOString()
      : null;

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

        return productosActualizados;
      } else {
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
        };

        return [...prev, nuevoDetalle];
      }
    });

    // Reset campos
    setValue("producto", "");
    setValue("cant_dcom", 1);
    setValue("prec_uni_dcom", 0);
    setValue("fech_ven_prod_dcom", null);
  };

  /* Regresar al listado de compras */
  const handleGoBack = () => {
    router.back();
  };
  /* Ttoal de productos */
  const totalCompra = productos.reduce(
    (acc, item) => acc + item.prec_uni_dcom * item.cant_dcom,
    0,
  );

  const onSubmit = async (formData: any) => {
    const body: Partial<ICompra> = {
      fech_comp: new Date().toISOString(),
      estado_comp: "pendiente",
      estado_pag_comp: "pendiente",
      observ_comp: "",
      tot_comp: productos.reduce(
        (acc, item) => acc + item.prec_uni_dcom * item.cant_dcom,
        0,
      ),
    };

    const res = await fetch("http://localhost:5000/compras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push("/compras");
    } else {
      alert("Error al crear compra");
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
          {/* Titulo de la pagina */}
          <div className="flex flex-wrap gap-4">
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

          {/* Detalle del vendedor */}
          <div className="mt-2 w-full">
            <div className="mb-2 flex items-center">
              <ShoppingBag className="mr-2 h-4 w-4" />
              <h3 className="font-semibold">Detalle de la venta</h3>
            </div>

            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
              <div className="w-full">
                <CampoProveedor
                  control={control}
                  name="proveedor"
                  label="Proveedor"
                  options={proveedores}
                />
              </div>

              <div className="w-full">
                <CampoTipoDocumento
                  control={control}
                  name="tipo_doc_comp"
                  label="Tipo de documento"
                />
              </div>

              <div className="w-full">
                <CampoTexto
                  control={control}
                  name="num_doc_comp"
                  placeholder="Ingresa el numero de la factura"
                  label="Número de documento"
                />
              </div>

              <div className="w-full">
                <CampoFormaPago
                  control={control}
                  name="forma_pago_comp"
                  label="Forma de pago"
                />
              </div>

              <div className="w-full">
                <CampoTextArea
                  control={control}
                  name="observ_comp"
                  label="Observaciones"
                  placeholder="Escriba alguna observación relevante"
                />
              </div>
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
                  name="producto"
                  label="Producto"
                  options={productosOptions}
                />
              </div>

              <div>
                <CampoNumero
                  control={control}
                  name="cant_dcom"
                  label="Cantidad"
                />
              </div>

              <div>
                <CampoNumero
                  control={control}
                  name="prec_uni_dcom"
                  label="Precio Unitario"
                />
              </div>

              <div>
                <CampoFecha
                  control={control}
                  name="fech_ven_prod_dcom"
                  label="Fecha de vencimiento"
                />
              </div>

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
                    <th className="p-2">Producto</th>
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
                        <div className="flex items-center justify-center gap-3">
                          {item.prod_dcom.img_prod && (
                            <Image
                              src={item.prod_dcom.img_prod}
                              alt={item.prod_dcom.nom_prod}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium">
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
                          variant={"ghost"}
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

            {/* Total de la compra */}
            <div className="flex justify-end rounded-b-md border-border bg-muted px-4 py-2">
              <p className="text-sm font-semibold">
                Total:{" "}
                <span className="text-base text-foreground">
                  ${totalCompra.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
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
      </FormProvider>
    </ModulePageLayout>
  );
}
