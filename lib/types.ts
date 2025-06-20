export interface ICategory {
  id_cate: number;
  nom_cate: string;
  desc_cate?: string;
  est_cate?: string;
}

export interface IProveedor {
  id_prov: number;
  nom_prov: string;
  cont_prov: string;
  tel_prov: string;
  direc_prov: string;
  email_prov: string;
  ruc_prov: string;
  img_prov: string;
  est_prov: string;
}

export interface IEquivalencia {
  id_equiv: number;
  prod_equiv: IProduct;
  und_prod_equiv: string;
  cant_equiv: number;
  est_equiv: string;
}

export interface IDetalleProductoVenta {
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface IVentaDetalle {
  id_venta: number;
  cliente: IUsuario;
  tipoOrden: string;
  estado: string;
  tipoPago: string;
  comprobante: string | null;
  comprobanteImg: string;
  fecha: string;
  efectivoRecibido: number;
  efectivoCambio: number;
  total: number;
  productos: IDetalleProductoVenta[];
}

export interface IProduct {
  id_prod: number;
  nom_prod: string;
  tip_prod: string;
  und_prod: string;
  prec_vent_prod: number;
  prec_comp_prod: number;
  stock_prod: number;
  img_prod: string;
  est_prod: string;
  cate_prod: ICategory | null;
  fecha_vence_proxima?: string;
  dias_restantes?: number;
  interpretacion_stock?: string;
}

export interface IReceta {
  id_rec: number;
  nom_rec: string;
  desc_rec: string;
  prod_rec: IProduct;
  ingredientes: IDetReceta[];
}

export interface ICompra {
  id_comp: number;
  tot_comp: number;
  prov_comp: IProveedor;
  usu_comp: IUsuario;
  fech_comp: string;
  estado_comp: string;
  estado_pag_comp: string;
  crea_en_comp: Date;
  act_en_comp: Date;
  observ_comp: string;
  tipo_doc_comp: string;
  num_doc_comp: string;
  form_pag_comp: string;
  fech_pag_comp?: string;
  fech_venc_comp: string;
  obs_pago_efec_comp?: string;
  num_tra_comprob_comp?: string;
  comprob_tran_comp?: string;
  dias_credito?: number | null;
}

export interface IDetReceta {
  id_det_rec: number;
  recet_rec: IReceta;
  prod_rec: IProduct;
  cant_rec: number;
  und_prod_rec: string;
}

export interface IDetRecetaSinReceta {
  id_det_rec: number;
  prod_rec: IProduct;
  cant_rec: number;
  und_prod_rec: string;
}

export interface IRecetaForm {
  nom_rec?: string;
  desc_rec: string;
  prod_rec: string; // id del producto final
  pvp_rec: number;
  ingredientes: {
    prod_rec: string; // id del producto insumo
    cant_rec: number;
    und_prod_rec: string;
  }[];
}

export interface ICierreDiario {
  id_cier: number;
  fech_cier: string;
  tot_vent_cier: number;
  tot_dep_cier: number;
  tot_gas_cier: number;
  tot_compras_pag_cier: number;
  dif_cier: number;
  comp_dep_cier: string;
  fech_reg_cier: string;
  usu_cier: IUsuario;
  esta_cier: string;
}

export interface IUsuario {
  id_usu: string;
  nom_usu: string;
  email_usu: string;
  rol_usu: IRol;
  img_usu: string;
}

export interface IDetCompra {
  id_dcom: number;
  comp_dcom: ICompra;
  prod_dcom: IProduct;
  fech_ven_prod_dcom: string | null;
  cant_dcom: number;
  prec_uni_dcom: number;
  sub_tot_dcom: number;
  lote_dcom: string;
  cant_usada_dcom: number;
  cant_disponible_dcom: number;
  est_lote_dcom: string;
}

export interface IRol {
  id_rol: number;
  nom_rol: string;
  desc_rol?: string;
  est_rol?: string;
}

export interface IGasto {
  id_gas: number;
  desc_gas: string;
  mont_gas: number;
  fech_gas: string;
  obs_gas: string;
}

export interface IResumenDelDia {
  totalVentas: number;
  totalGastos: number;
  totalComprasPagadas: number;
}

export type IProductEdit = Omit<IProduct, "cate_prod"> & {
  cate_prod: number;
  id_prod?: number;
};
export type IProductCreate = Omit<IProduct, "id_prod" | "cate_prod"> & {
  cate_prod: number;
};
