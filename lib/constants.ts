export const UNIT_OPTIONS = [
  { label: "Quintal (qq)", value: "qq" },
  { label: "Kilogramo (kg)", value: "kg" },
  { label: "Unidad (und)", value: "und" },
  { label: "Libra (lb)", value: "lb" },
  { label: "Gramo (g)", value: "g" },
  { label: "Presas", value: "presas" },
];
export const TIP_PROD_OPTIONS = [
  { label: "Insumo", value: "Insumo" },
  { label: "Transformado", value: "Transformado" },
  { label: "Directo", value: "Directo" },
  { label: "Combo", value: "Combo" },
];
export const TIPO_DOCUMENTO_OPTIONS = [
  { value: "factura", label: "Factura" },
  { value: "nota", label: "Nota de venta" },
  { value: "guia", label: "Guía de remisión" },
  { value: "otro", label: "Otro" },
];
export const FORMA_PAGO_OPTIONS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  /* { value: "tarjeta", label: "Tarjeta" }, */
  { value: "credito", label: "Crédito" },
  /*  { value: "otro", label: "Otro" }, */
];

/* Defaults */

export const DEFAULT_USER_URL = "/imagenes/default/user_default.webp";
export const DEFAULT_PRODUCT_IMAGE_URL =
  "/imagenes/default/producto_default.webp";

export const DEFAULT_PROVEEDOR_IMAGE_URL =
  "/imagenes/default/proveedor_default.webp";

export const DEFAULT_EMPRESA_IMAGE_URL =
  "/imagenes/default/empresa_default.webp";
