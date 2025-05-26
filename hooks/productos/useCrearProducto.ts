import { uploadImage } from "@/firebase/subirImage";
import { DEFAULT_PRODUCT_IMAGE_URL } from "@/lib/constants";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { ToastError } from "@/components/shared/toast/toastError";
import { SERVICIOS_PRODUCTOS } from "@/services/productos.service";

export interface CrearProductoPayload {
  nombre: string;
  categoria: string;
  tipo: string;
  unidad: string;
  imagenArchivo?: File | null;
  imagenPreview?: string | null;
  onSuccess: (data: any) => void;
  onError?: (error: any) => void;
}

export function useCrearProducto() {
  const crearProducto = async ({
    nombre,
    categoria,
    tipo,
    unidad,
    imagenArchivo,
    imagenPreview,
    onSuccess,
    onError,
  }: CrearProductoPayload) => {
    try {
      let imageUrl = imagenPreview || "";

      if (imagenArchivo) {
        imageUrl = await uploadImage(
          imagenArchivo,
          "productos",
          `producto_${nombre.replace(/\s+/g, "_").toLowerCase()}`,
        );
      } else {
        imageUrl = DEFAULT_PRODUCT_IMAGE_URL;
      }

      const payload = {
        nom_prod: nombre,
        cate_prod: tipo.toLowerCase() === "insumo" ? null : Number(categoria),
        tip_prod: tipo,
        und_prod: unidad,
        img_prod: imageUrl,
      };

      const response = await fetch(SERVICIOS_PRODUCTOS.productos, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear producto");
      }

      ToastSuccess({ message: "Producto creado correctamente" });
      onSuccess(data);
    } catch (error) {
      console.error("❌ Error al crear el producto:", error);
      ToastError({ message: "Error al crear el producto" });
      onError?.(error);
    }
  };

  return { crearProducto };
}
