// En tu archivo types.ts (o donde definas tus interfaces)
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

export type IProductEdit = Omit<IProduct, "cate_prod"> & {
  cate_prod: number;
  id_prod?: number;
};
export type IProductCreate = Omit<IProduct, "id_prod" | "cate_prod"> & { cate_prod: number };




