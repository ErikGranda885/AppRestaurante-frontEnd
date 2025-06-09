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
    <div className="relative flex h-screen w-full">
      {/* Fondo con imagen y blur solo en móviles/tablets */}
      <div className="absolute inset-0 block xl:hidden">
        <Image
          src="/imagenes/portada-login.jpg"
          alt="Fondo de login"
          fill
          className="object-cover blur-sm"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Panel Izquierdo: Logo y formulario */}
      <div className="relative z-10 flex max-w-full flex-1 flex-col border border-border bg-background/80 shadow-md backdrop-blur-md xl:max-w-[400px] xl:shadow-none">
        <div className="flex flex-1 items-start justify-center pt-[30%]">
          <div className="w-full px-6 lg:px-6">
            <div className="flex justify-center p-4">
              <div className="relative size-36 xl:size-28">
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

        {/* Footer con copyright */}
        <div className="pb-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Desarrollado por ErikDev. Todos los derechos
          reservados.
        </div>
      </div>

      {/* Panel Derecho solo visible en xl+ */}
      <div className="relative hidden flex-1 xl:flex">
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
