"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useConfiguracionesSeguridad } from "@/hooks/configuraciones/generales/useConfiguracionesSeguridad";

export function SeguridadConfiguracion() {
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
                value={longitudMinimaPassword}
                onChange={(e) =>
                  setLongitudMinimaPassword(parseInt(e.target.value) || 0)
                }
                disabled={loading}
              />
            </div>

            <div>
              <Label>Máximo de intentos de login</Label>
              <Input
                type="number"
                value={maxIntentosLogin}
                onChange={(e) =>
                  setMaxIntentosLogin(parseInt(e.target.value) || 0)
                }
                disabled={loading}
              />
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
                checked={activarGoogleLogin}
                onCheckedChange={(checked) => setActivarGoogleLogin(checked)}
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
                checked={bloquearUsuarioPorIntentos}
                onCheckedChange={(checked) =>
                  setBloquearUsuarioPorIntentos(checked)
                }
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
