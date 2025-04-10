export interface ICategory {
  id_cate: number;
  nom_cate: string;
  desc_cate?: string;
  est_cate?: string;
}

export interface IProduct {
  id_prod: number;
  nom_prod: string;
  prec_prod: number;
  iva_prod: boolean;
  stock_prod: number;
  cate_prod: ICategory;
  est_prod: string;
  fech_ven_prod: string;
  img_prod: string;
  mat_prod?: boolean;
}
export interface IInsumo {
  id_ins: number;
  nom_ins: string;
  und_ins: string;
  stock_ins: number;
  cost_uni_ins: number;
  fech_ven_ins: string;
  stock_min_ins: number;
  est_insu: string;
}
export interface ICompraInsumo {
  id_comp: number;
  prov_comp: number;
  fech_comp: string;
  insu_comp: number;
  cant_comp: number;
  cost_comp: number;
  obs_comp: string;
  fact_comp: number;
  prod_comp: IProduct;
  tot_comp: number;
  crea_en_comp: string;
  act_en_comp: string;
  estado_comp: string;
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
