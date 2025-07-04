"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useConfiguracionesSeguridad } from "@/hooks/configuraciones/generales/useConfiguracionesSeguridad";
import { useEffect, useState } from "react";
import { ToastSuccess } from "../../toast/toastSuccess";
import { z } from "zod";

export function SeguridadConfiguracion() {
  const schema = z.object({
    longitudMinimaPassword: z
      .number({ invalid_type_error: "Solo números" })
      .min(6, "Debe ser mayor o igual a 6"),
    maxIntentosLogin: z
      .number({ invalid_type_error: "Solo números" })
      .min(1, "Debe ser mayor o igual a 1"),
  });
  const {
    activarGoogleLogin,
    setActivarGoogleLogin,
    longitudMinimaPassword,
    setLongitudMinimaPassword,
    bloquearUsuarioPorIntentos,
    setBloquearUsuarioPorIntentos,
    maxIntentosLogin,
    setMaxIntentosLogin,
    loading,
  } = useConfiguracionesSeguridad();

  const [localPasswordLength, setLocalPasswordLength] = useState(
    longitudMinimaPassword.toString(),
  );
  const [localMaxIntentos, setLocalMaxIntentos] = useState(
    maxIntentosLogin.toString(),
  );
  const [localGoogleLogin, setLocalGoogleLogin] = useState(activarGoogleLogin);
  const [localBloqueoIntentos, setLocalBloqueoIntentos] = useState(
    bloquearUsuarioPorIntentos,
  );

  const [errorPasswordLength, setErrorPasswordLength] = useState("");
  const [errorMaxIntentos, setErrorMaxIntentos] = useState("");

  const hayCambios =
    localPasswordLength !== longitudMinimaPassword.toString() ||
    localMaxIntentos !== maxIntentosLogin.toString() ||
    localGoogleLogin !== activarGoogleLogin ||
    localBloqueoIntentos !== bloquearUsuarioPorIntentos;

  useEffect(() => {
    setLocalPasswordLength(longitudMinimaPassword.toString());
  }, [longitudMinimaPassword]);

  useEffect(() => {
    setLocalMaxIntentos(maxIntentosLogin.toString());
  }, [maxIntentosLogin]);

  const handleGuardar = () => {
    let valido = true;

    const nuevaLongitud = parseInt(localPasswordLength);
    if (isNaN(nuevaLongitud) || nuevaLongitud < 6) {
      setErrorPasswordLength("Debe ser mayor o igual a 6");
      valido = false;
    }

    const nuevosIntentos = parseInt(localMaxIntentos);
    if (isNaN(nuevosIntentos) || nuevosIntentos < 1) {
      setErrorMaxIntentos("Debe ser mayor o igual a 1");
      valido = false;
    }

    if (!valido) return;

    // Actualizar los valores
    setLongitudMinimaPassword(nuevaLongitud);
    setMaxIntentosLogin(nuevosIntentos);
    setActivarGoogleLogin(localGoogleLogin);
    setBloquearUsuarioPorIntentos(localBloqueoIntentos);

    // ✅ Mostrar toast
    ToastSuccess({
      message: "Cambias guardados exitosamente",
    });
  };

  const handleCancelar = () => {
    setLocalPasswordLength(longitudMinimaPassword.toString());
    setLocalMaxIntentos(maxIntentosLogin.toString());
    setLocalGoogleLogin(activarGoogleLogin);
    setLocalBloqueoIntentos(bloquearUsuarioPorIntentos);
    setErrorPasswordLength("");
    setErrorMaxIntentos("");
  };

  return (
    <div className="space-y-10 pt-4">
      <Card className="border border-border bg-background p-6 pb-10 shadow-sm">
        <h3 className="text-lg font-semibold">Configuración de Seguridad</h3>
        <p className="text-sm text-muted-foreground">
          Administra los parámetros de autenticación y seguridad del sistema.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-6">
          {/* Inputs izquierda */}
          <div className="space-y-6">
            <div>
              <Label>Longitud mínima de contraseña</Label>
              <Input
                type="number"
                value={localPasswordLength}
                onChange={(e) => {
                  setLocalPasswordLength(e.target.value);
                  setErrorPasswordLength("");
                }}
                disabled={loading}
              />
              {errorPasswordLength && (
                <p className="text-sm text-destructive">
                  {errorPasswordLength}
                </p>
              )}
            </div>

            <div>
              <Label>Máximo de intentos de login</Label>
              <Input
                type="number"
                value={localMaxIntentos}
                onChange={(e) => {
                  setLocalMaxIntentos(e.target.value);
                  setErrorMaxIntentos("");
                }}
                disabled={loading}
              />
              {errorMaxIntentos && (
                <p className="text-sm text-destructive">{errorMaxIntentos}</p>
              )}
            </div>
          </div>

          {/* Switches derecha */}
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-md border border-border px-4 py-4">
              <div>
                <p className="text-sm font-medium">Activar Login con Google</p>
                <p className="text-xs text-muted-foreground">
                  Permite a los usuarios iniciar sesión utilizando su cuenta de
                  Google.
                </p>
              </div>
              <Switch
                checked={localGoogleLogin}
                onCheckedChange={setLocalGoogleLogin}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border border-border px-4 py-4">
              <div>
                <p className="text-sm font-medium">
                  Bloquear usuario por intentos fallidos
                </p>
                <p className="text-xs text-muted-foreground">
                  Bloquea automáticamente la cuenta tras superar el límite de
                  intentos fallidos.
                </p>
              </div>
              <Switch
                checked={localBloqueoIntentos}
                onCheckedChange={setLocalBloqueoIntentos}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Botones si hay cambios */}
        {hayCambios && (
          <div className="mt-6 flex gap-4">
            <Button onClick={handleGuardar} disabled={loading}>
              Guardar
            </Button>
            <Button
              variant="secondary"
              onClick={handleCancelar}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
