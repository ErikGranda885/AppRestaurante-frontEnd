"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { DEFAULT_EMPRESA_IMAGE_URL } from "@/lib/constants";
import { SERVICIOS_EMPRESAS } from "@/services/empresas.service";

export default function LoginPage() {
  const [logo, setLogo] = useState(DEFAULT_EMPRESA_IMAGE_URL);
  const [isMounted, setIsMounted] = useState(false); // ✅ NUEVO

  useEffect(() => {
    setIsMounted(true); // ✅ para esperar al cliente

    const cargarLogoEmpresa = async () => {
      const empresaLS = localStorage.getItem("empresa_actual");
      if (empresaLS && empresaLS !== "null") {
        try {
          const empresa = JSON.parse(empresaLS);
          setLogo(
            empresa.logo_emp && empresa.logo_emp !== "null"
              ? empresa.logo_emp
              : DEFAULT_EMPRESA_IMAGE_URL,
          );
          return;
        } catch (error) {
          console.error("Error al parsear empresa_actual:", error);
        }
      }

      // 👇 Si no existe en localStorage → obtener de la BD
      try {
        const res = await fetch(SERVICIOS_EMPRESAS.obtener);
        if (!res.ok) throw new Error("Error al obtener empresa");
        const data = await res.json();

        const empresa = data.empresa; // ✅ tu estructura
        const logoBD =
          empresa?.logo_emp && empresa.logo_emp !== "null"
            ? empresa.logo_emp
            : DEFAULT_EMPRESA_IMAGE_URL;

        setLogo(logoBD);
        localStorage.setItem("empresa_actual", JSON.stringify(empresa));
      } catch (error) {
        setLogo(DEFAULT_EMPRESA_IMAGE_URL);
      }
    };

    if (typeof window !== "undefined") {
      cargarLogoEmpresa(); // ✅ solo se ejecuta en cliente
    }
  }, []);

  if (!isMounted) return null; // ✅ evita renderizar hasta montar

  return (
    <div className="flex h-screen w-full">
      {/* Panel Izquierdo: Logo y formulario */}
      <div className="flex max-w-full flex-1 flex-col border border-border md:max-w-[500px]">
        <div className="mt-[5%] flex flex-1 justify-center">
          <div className="w-full max-w-xs">
            <div className="flex justify-center p-4 md:p-6">
              <div className="relative size-28">
                <Image
                  key={logo}
                  src={logo}
                  alt="Logo Empresa"
                  fill
                  className="rounded-md object-contain"
                  onError={() => setLogo(DEFAULT_EMPRESA_IMAGE_URL)}
                />
              </div>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Panel Derecho: Imagen de fondo */}
      <div className="relative hidden flex-1 bg-muted lg:flex">
        <Image
          src="/imagenes/portada-login.jpg"
          alt="Fondo de login"
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
    </div>
  );
}
