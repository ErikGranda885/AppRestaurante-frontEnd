"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { ToastError } from "@/components/shared/toast/toastError";
import { SERVICIOS_AUTH } from "@/services/auth.service";
import { SERVICIOS_EMPRESAS } from "@/services/empresas.service";
import { DEFAULT_EMPRESA_IMAGE_URL } from "@/lib/constants";
import { useRouter } from "next/navigation";

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState(DEFAULT_EMPRESA_IMAGE_URL);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);

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

      try {
        const res = await fetch(SERVICIOS_EMPRESAS.obtener);
        if (!res.ok) throw new Error("Error al obtener empresa");
        const data = await res.json();
        const empresa = data.empresa;
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
      cargarLogoEmpresa();
    }
  }, []);

  const handleRecuperar = async () => {
    if (!email) return ToastError({ message: "Ingresa un correo válido" });

    try {
      setLoading(true);
      const res = await fetch(SERVICIOS_AUTH.enviarCorreoRecuperacion, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al enviar el correo");
      }

      ToastSuccess({ message: "📩 Correo de recuperación enviado" });

      setEnviado(true);
      setEmail("");
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
          alt="Recuperar contraseña"
          fill
          className="object-cover"
        />
      </div>

      {/* Panel derecho con formulario */}
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

          {/* Volver */}
          <Button
            onClick={() => router.push("login")}
            variant={"ghost"}
            className="text-sm hover:underline"
          >
            ← Volver al inicio de sesión
          </Button>

          {/* Título */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Recuperar Contraseña
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ingresa tu correo registrado y te enviaremos instrucciones.
            </p>
          </div>

          {/* Formulario */}
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button
              className="w-full"
              onClick={handleRecuperar}
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar instrucciones"}
            </Button>

            {enviado && (
              <p className="text-center text-sm text-green-600 dark:text-green-400">
                Revisa tu correo para continuar.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="pt-6 text-center text-xs text-muted-foreground">
            <a href="#">Términos y Condiciones</a> •{" "}
            <a href="#">Política de Privacidad</a>
          </div>
        </div>
      </div>
    </div>
  );
}
