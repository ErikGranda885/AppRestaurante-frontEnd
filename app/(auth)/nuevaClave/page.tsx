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
import { CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";

export default function RestablecerPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [clave, setClave] = useState("");
  const [confirmarClave, setConfirmarClave] = useState("");
  const [showClave, setShowClave] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
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
              : DEFAULT_EMPRESA_IMAGE_URL
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

  const validarRequisitos = (clave:any) => ({
    longitud: clave.length >= 8,
    mayuscula: /[A-Z]/.test(clave),
    minuscula: /[a-z]/.test(clave),
    numero: /[0-9]/.test(clave),
    especial: /[^A-Za-z0-9]/.test(clave),
    coinciden: clave === confirmarClave && confirmarClave.length > 0,
  });

  const requisitosCumplidos = Object.values(validarRequisitos(clave)).every(Boolean);

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
          token,
          nuevaContrasena: clave,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al restablecer");

      ToastSuccess({ message: "✅ Contraseña actualizada correctamente" });
      router.push("login");
    } catch (err:any) {
      ToastError({ message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full bg-background">
      <div className="absolute inset-0 block xl:hidden">
        <Image
          src="/imagenes/recuperar.avif"
          alt="Fondo recuperación"
          fill
          className="object-cover blur-sm"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="relative hidden w-full xl:block">
        <Image
          src="/imagenes/recuperar.avif"
          alt="Restablecer contraseña"
          fill
          className="object-cover"
        />
      </div>

      <div className="relative z-10 flex w-full flex-col p-6 xl:w-1/2">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full space-y-4 rounded-xl bg-background/85 p-6 shadow-md backdrop-blur-md xl:max-w-lg xl:shadow-none">
            {isMounted && (
              <div className="flex justify-center">
                <div className="relative size-28 xl:size-36">
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

            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">
                Establece una nueva contraseña
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Ingresa y confirma tu nueva contraseña.
              </p>
            </div>

            <div className="space-y-3">
              <div className="grid gap-1">
                <label htmlFor="clave">Nueva contraseña</label>
                <div className="relative">
                  <Input
                    id="clave"
                    type={showClave ? "text" : "password"}
                    value={clave}
                    onChange={(e) => setClave(e.target.value)}
                    className="border-black/70 dark:border-gray-500 xl:border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClave((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showClave ? (
                      <EyeOff className="h-5 w-5 text-gray-600 dark:text-white" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-600 dark:text-white" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid gap-1">
                <label htmlFor="confirmarClave">Confirmar contraseña</label>
                <div className="relative">
                  <Input
                    id="confirmarClave"
                    type={showConfirmar ? "text" : "password"}
                    value={confirmarClave}
                    onChange={(e) => setConfirmarClave(e.target.value)}
                    className="border-black/70 dark:border-gray-500 xl:border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmar((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showConfirmar ? (
                      <EyeOff className="h-5 w-5 text-gray-600 dark:text-white" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-600 dark:text-white" />
                    )}
                  </button>
                </div>
              </div>

              {(clave || confirmarClave) && (
                <div className="space-y-1 rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                  {Object.entries(validarRequisitos(clave)).map(([claveKey, cumple]) => (
                    <div key={claveKey} className="flex items-center gap-2">
                      {cumple ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>
                        {claveKey === "longitud" && "Al menos 8 caracteres"}
                        {claveKey === "mayuscula" && "Al menos una letra mayúscula"}
                        {claveKey === "minuscula" && "Al menos una letra minúscula"}
                        {claveKey === "numero" && "Al menos un número"}
                        {claveKey === "especial" && "Al menos un carácter especial"}
                        {claveKey === "coinciden" && "Las contraseñas coinciden"}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleRestablecer}
                disabled={loading || !requisitosCumplidos}
              >
                {loading ? "Procesando..." : "Actualizar contraseña"}
              </Button>
            </div>

            <div className="pt-6 text-center text-xs text-muted-foreground">
              <a href="#">Términos y Condiciones</a> • <a href="#">Política de Privacidad</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
