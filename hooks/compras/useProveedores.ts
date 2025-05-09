import { useEffect, useState } from "react";
import { IProveedor } from "@/lib/types";
import { SERVICIOS_PROVEEDORES } from "@/services/proveedores.service";
import { ProveedorOption } from "@/components/shared/compras/ui/campoProveedor";
import { ToastError } from "@/components/shared/toast/toastError";

export function useProveedores() {
  const [proveedores, setProveedores] = useState<ProveedorOption[]>([]);

  useEffect(() => {
    fetch(SERVICIOS_PROVEEDORES.proveedores)
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
          contacto: prov.cont_prov,
          telefono: prov.tel_prov,
          direccion: prov.direc_prov,
          correo: prov.email_prov,
          imagen: prov.img_prov,
        }));

        setProveedores(opciones);
      })
      .catch((err) => {
        console.error("Error al cargar proveedores:", err);
        ToastError({ message: "Error al cargar proveedores: " + err.message });
      });
  }, []);

  return proveedores;
}
