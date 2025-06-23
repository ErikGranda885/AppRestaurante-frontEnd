export interface FlowProducto {
  type: "producto";
  step:
    | "confirmacion"
    | "tipo"
    | "categoria"
    | "unidad"
    | "sugerenciaInventario";
  data: {
    nom_prod: string;
    cate_prod?: number;
    tip_prod?: string;
    und_prod?: string;
    sugerencias?: string[];
  };
}

export interface FlowVenta {
  type: "venta";
  step:
    | "categoria"
    | "producto"
    | "cantidad"
    | "agregarOtro"
    | "pago"
    | "montoEfectivo"
    | "comprobante"
    | "confirmacion";
  data: {
    categoriaId?: number;
    categoriaNombre?: string;
    productoId?: number;
    productoNombre?: string;
    cantidad?: number;
    metodoPago?: "efectivo" | "transferencia";
    comprobanteNumero?: string;
    precioUnitario?: number;
    stockDisponible?: number;
    totalVenta?: number;
    productos?: {
      productoId: number;
      productoNombre: string;
      cantidad: number;
      precioUnitario: number;
    }[];
  };
}

export interface FlowReporte {
  step: "modulo" | "subreporte" | "formato" | "confirmacion";
  data: {
    modulo?: "productos" | "produccion" | "compras" | "ventas" | "gastos";
    subreporte?: string;
    formato?: "excel" | "pdf";
    inicioFlujo?: number;
  };
}
