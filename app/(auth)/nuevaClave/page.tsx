"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToastError } from "@/components/shared/toast/toastError";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { SERVICIOS_AUTH } from "@/services/auth.service";
import { DEFAULT_EMPRESA_IMAGE_URL } from "@/lib/constants";
import { SERVICIOS_EMPRESAS } from "@/services/empresas.service";

export default function RestablecerPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [clave, setClave] = useState("");
  const [confirmarClave, setConfirmarClave] = useState("");
  const [logo, setLogo] = useState(DEFAULT_EMPRESA_IMAGE_URL);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const cargarLogoEmpresa = async () => {
      try {
        const empresaLS = localStorage.getItem("empresa_actual");
        if (empresaLS && empresaLS !== "null") {
          const empresa = JSON.parse(empresaLS);
          setLogo(
            empresa.logo_emp && empresa.logo_emp !== "null"
              ? empresa.logo_emp
              : DEFAULT_EMPRESA_IMAGE_URL,
          );
          return;
        }

        const res = await fetch(SERVICIOS_EMPRESAS.obtener);
        const data = await res.json();
        const empresa = data.empresa;
        const logoBD =
          empresa?.logo_emp && empresa.logo_emp !== "null"
            ? empresa.logo_emp
            : DEFAULT_EMPRESA_IMAGE_URL;

        setLogo(logoBD);
        localStorage.setItem("empresa_actual", JSON.stringify(empresa));
      } catch {
        setLogo(DEFAULT_EMPRESA_IMAGE_URL);
      }
    };

    if (typeof window !== "undefined") cargarLogoEmpresa();
  }, []);

  const handleRestablecer = async () => {
    if (!token) return ToastError({ message: "Token inválido o expirado" });
    if (!clave || !confirmarClave)
      return ToastError({ message: "Todos los campos son obligatorios" });
    if (clave !== confirmarClave)
      return ToastError({ message: "Las contraseñas no coinciden" });

    try {
      setLoading(true);
      const res = await fetch(SERVICIOS_AUTH.restablecerPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, // ✅ ahora va aquí, no en la URL
          nuevaContrasena: clave,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al restablecer");

      ToastSuccess({ message: "✅ Contraseña actualizada correctamente" });
      router.push("login");
    } catch (err: any) {
      ToastError({ message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Panel izquierdo con imagen */}
      <div className="relative hidden w-full lg:block">
        <Image
          src="/imagenes/recuperar.avif"
          alt="Restablecer contraseña"
          fill
          className="object-cover"
        />
      </div>

      {/* Panel derecho */}
      <div className="flex w-full items-center justify-center bg-background p-6 md:w-1/2">
        <div className="w-full max-w-sm space-y-1">
          {/* Logo */}
          {isMounted && (
            <div className="flex justify-center">
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
          )}

          {/* Título */}
          <div className="mb-3 text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Establece una nueva contraseña
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ingresa y confirma tu nueva contraseña.
            </p>
          </div>

          {/* Formulario */}
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Nueva contraseña"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmarClave}
              onChange={(e) => setConfirmarClave(e.target.value)}
            />

            <Button
              className="w-full"
              onClick={handleRestablecer}
              disabled={loading}
            >
              {loading ? "Procesando..." : "Actualizar contraseña"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
