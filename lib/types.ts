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

export interface IDetalleProductoVenta {
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface IVentaDetalle {
  id_venta: number;
  cliente: IUsuario;
  tipoOrden: string; // Alias de tip_pag_vent
  estado: string; // est_vent
  tipoPago: string; // tip_pag_vent
  comprobante: string | null; // comprobante_num_vent
  comprobanteImg: string;
  fecha: string; // fech_vent
  efectivoRecibido: number;
  efectivoCambio: number;
  total: number; // tot_vent
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
  fech_venc_comp: string;
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

export type IProductEdit = Omit<IProduct, "cate_prod"> & {
  cate_prod: number;
  id_prod?: number;
};
export type IProductCreate = Omit<IProduct, "id_prod" | "cate_prod"> & {
  cate_prod: number;
};
