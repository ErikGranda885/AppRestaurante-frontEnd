"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  const [logo, setLogo] = useState("/imagenes/empresaDefecto.webp");

  useEffect(() => {
    const empresaLS = localStorage.getItem("empresa_actual");
    if (empresaLS && empresaLS !== "null") {
      try {
        const empresa = JSON.parse(empresaLS);
        if (empresa.logo_emp) {
          setLogo(
            empresa.logo_emp.startsWith("http")
              ? empresa.logo_emp
              : "/imagenes/empresaDefecto.webp",
          );
        }
      } catch (error) {
        console.error("Error al obtener empresa_actual:", error);
      }
    }
  }, []);

  return (
    <div className="flex h-screen w-full">
      {/* Panel Izquierdo: Logo y formulario */}
      <div className="flex max-w-full flex-1 flex-col border border-border md:max-w-[500px]">
        {/* Formulario centrado */}
        <div className="mt-[5%] flex flex-1 justify-center">
          <div className="w-full max-w-xs">
            {/* ✅ Logo arriba */}
            <div className="flex justify-center p-4 md:p-6">
              <div className="relative size-28">
                <Image
                  src={logo}
                  alt="Logo Empresa"
                  fill
                  className="rounded-md object-contain"
                  onError={() => setLogo("/imagenes/logo.png")}
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
