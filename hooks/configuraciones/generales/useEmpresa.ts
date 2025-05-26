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

  const fetchEmpresa = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(SERVICIOS_EMPRESAS.obtener, {
        method: "GET",
        credentials: "include", // ✅ Usa cookie HTTP-only
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
        window.dispatchEvent(new Event("empresaUpdated"));
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

    const options: RequestInit = {
      method: empresa?.id_emp ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // ✅ Usa cookie HTTP-only
      body: JSON.stringify(bodyData),
    };

    const url = empresa?.id_emp
      ? SERVICIOS_EMPRESAS.actualizar(empresa.id_emp)
      : SERVICIOS_EMPRESAS.crear;

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error("Error al guardar la empresa");
    }

    const resData = await response.json();
    result = resData.empresa;

    setEmpresa(result);
    localStorage.setItem("empresa_actual", JSON.stringify(result));
    window.dispatchEvent(new Event("empresaUpdated"));
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
