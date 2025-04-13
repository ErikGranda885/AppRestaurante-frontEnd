export interface ICategory {
  id_cate: number;
  nom_cate: string;
  desc_cate?: string;
  est_cate?: string;
}

export interface IProduct {
  id_prod: number;
  nom_prod: string;
  tip_prod: string;
  und_prod: string;
  prec_vent_prod: number;
  prec_comp_prod: number;
  stock_prod: number;
  fech_ven_prod: string | null;
  img_prod: string;
  est_prod: string;
  cate_prod: ICategory | null;
}

export interface ICompra {
  id_comp: number;
  tot_comp: number;
  prov_comp: number;
  usu_comp: number;
  fech_comp: string;
  estado_comp: string;
  estado_pag_comp: string;
  crea_en_comp: Date;
  act_en_comp: Date;
}

export interface IDetCompra {
  id_dcom: number;
  comp_dcom: ICompra;
  prod_dcom: number;
  cant_dcom: number;
  prec_uni_dcom: number;
  sub_tot_dcom: number;
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
