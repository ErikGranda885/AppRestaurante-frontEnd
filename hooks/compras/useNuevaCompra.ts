import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProveedores } from "@/hooks/compras/useProveedores";
import { useProductos } from "@/hooks/compras/useProductos";
import { useUsuarioActual } from "@/hooks/compras/useUsuarioActual";
import { useUltimoIdCompra } from "@/hooks/compras/useUltimoIdCompra";
import { useConfiguracionesVentas } from "@/hooks/configuraciones/generales/useConfiguracionesVentas";
import { validarEquivalenciaActiva } from "@/hooks/compras/validarEquivalenciaActiva";
import { IDetCompra } from "@/lib/types";

const DIAS_UMBRAL_POR_VENCER = 30;

export const useNuevaCompra = () => {
  const router = useRouter();
  const { ventasConfig } = useConfiguracionesVentas();
  const proveedores = useProveedores();
  const { productosOptions, setProductosOptions } = useProductos();
  const usuarioActual = useUsuarioActual();
  const ultimoIdCompra = useUltimoIdCompra();
  const [productos, setProductos] = useState<IDetCompra[]>([]);
  const [bloquearAñadirFila, setBloquearAñadirFila] = useState(false);
  const [openFactura, setOpenFactura] = useState(false);
  const [compraPreview, setCompraPreview] = useState<any | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

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
    equivalenciaSeleccionada: z.string().optional(),
    dias_credito: z.string().optional(),
  });

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
      equivalenciaSeleccionada: "",
      dias_credito: "",
    },
    resolver: zodResolver(schema),
  });

  const { control, handleSubmit, watch, setValue } = methods;
  const producto = productosOptions.find((p) => p.value === watch("producto"));
  const esInsumo = producto?.tipo === "Insumo";

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

  const calcularEstadoLote = (
    fechaVencimiento: string | null,
    diasPorVencer = DIAS_UMBRAL_POR_VENCER,
  ): "vigente" | "por_vencer" | "vencido" => {
    if (!fechaVencimiento) return "vigente";

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const vencimiento = new Date(fechaVencimiento);
    vencimiento.setHours(0, 0, 0, 0);

    const diferenciaDias = Math.floor(
      (vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diferenciaDias < 0) return "vencido";
    if (diferenciaDias <= diasPorVencer) return "por_vencer";
    return "vigente";
  };

  return {
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
  };
};
