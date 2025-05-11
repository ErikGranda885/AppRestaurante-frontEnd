"use client";

import { uploadImage } from "@/firebase/subirImage";
import { SERVICIOS_EMPRESAS } from "@/services/empresas.service";
import { useEffect, useState } from "react";

export interface Empresa {
  id_emp?: number;
  nom_emp: string;
  ruc_emp: string;
  dir_emp: string;
  tel_emp: string;
  corre_emp: string;
  logo_emp: string;
}

export function useEmpresa() {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const fetchEmpresa = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(SERVICIOS_EMPRESAS.obtener, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 404) {
        setEmpresa(null);
        localStorage.setItem("empresa_actual", "null");
      } else if (!response.ok) {
        throw new Error("Error al obtener la empresa");
      } else {
        const data = await response.json();
        setEmpresa(data.empresa);
        localStorage.setItem("empresa_actual", JSON.stringify(data.empresa));
        window.dispatchEvent(new Event("empresaUpdated")); // ✅ también aquí si carga al inicio
      }
    } catch (err: any) {
      setError("Error al cargar la empresa");
    } finally {
      setLoading(false);
    }
  };

  const saveEmpresa = async (
    data: Empresa,
    logoFile?: File,
    empresaId?: number,
  ) => {
    if (!token) throw new Error("No autorizado");

    let result: Empresa;
    let logoURL = data.logo_emp;

    if (logoFile) {
      try {
        logoURL = await uploadImage(
          logoFile,
          "empresas",
          empresaId ? `logo_empresa_${empresaId}` : "logo_empresa_default",
        );
      } catch (error) {
        console.error("Error subiendo logo:", error);
        throw new Error("No se pudo subir el logo. Intenta de nuevo.");
      }
    }

    const bodyData = {
      nom_emp: data.nom_emp,
      ruc_emp: data.ruc_emp,
      dir_emp: data.dir_emp,
      tel_emp: data.tel_emp,
      corre_emp: data.corre_emp,
      logo_emp: logoURL,
    };

    if (empresa?.id_emp) {
      const response = await fetch(
        SERVICIOS_EMPRESAS.actualizar(empresa.id_emp),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bodyData),
        },
      );

      if (!response.ok) throw new Error("Error al actualizar empresa");
      const resData = await response.json();
      result = resData.empresa;
    } else {
      const response = await fetch(SERVICIOS_EMPRESAS.crear, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) throw new Error("Error al crear empresa");
      const resData = await response.json();
      result = resData.empresa;
    }

    setEmpresa(result);
    localStorage.setItem("empresa_actual", JSON.stringify(result));
    window.dispatchEvent(new Event("empresaUpdated")); // ✅ notifica al sidebar
  };

  useEffect(() => {
    fetchEmpresa();
  }, []);

  return {
    empresa,
    loading,
    error,
    fetchEmpresa,
    saveEmpresa,
  };
}
