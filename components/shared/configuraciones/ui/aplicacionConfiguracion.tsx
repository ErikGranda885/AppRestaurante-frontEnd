"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import clsx from "clsx";

import { useConfiguracionAplicacion } from "@/hooks/configuraciones/generales/useConfiguracionesAplicacion";

export function AplicacionConfiguracion() {
  const {
    modoMantenimiento,
    setModoMantenimiento,
    versionApp,
    setVersionApp,
    colorTema,
    setColorTema,
    loading,
  } = useConfiguracionAplicacion();

  return (
    <div className="space-y-10 pt-4">
      <Card className="border border-border bg-background p-6 pb-10 shadow-sm">
        <h3 className="text-lg font-semibold">Configuración del Sistema</h3>
        <p className="text-sm text-muted-foreground">
          Ajusta parámetros generales del sistema y comportamiento visual.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-6">
          {/* Inputs izquierda */}
          <div className="space-y-6">
            <div>
              <Label>Versión actual de la aplicación</Label>
              <Input
                value={versionApp}
                onChange={(e) => setVersionApp(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <Label>Selecciona el tema</Label>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    value: "system",
                    label: "System preference",
                    image: "/imagenes/temas/sistema.png",
                  },
                  {
                    value: "light",
                    label: "Light",
                    image: "/imagenes/temas/light.png",
                  },
                  {
                    value: "dark",
                    label: "Dark",
                    image: "/imagenes/temas/dark.png",
                  },
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setColorTema(option.value)}
                    className={clsx(
                      "relative cursor-pointer rounded-lg border-border bg-card p-2 shadow-md transition hover:ring-2 hover:ring-primary/50",
                      colorTema === option.value
                        ? "ring-2 ring-primary"
                        : "border-border",
                      loading && "pointer-events-none opacity-50",
                    )}
                  >
                    <div className="aspect-video w-full overflow-hidden rounded-md">
                      <Image
                        src={option.image}
                        alt={option.label}
                        width={500}
                        height={300}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="mt-2 text-center text-sm font-medium text-muted-foreground">
                      {option.label}
                    </p>
                    {colorTema === option.value && (
                      <CheckCircle2 className="absolute right-2 top-2 h-5 w-5 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Switch derecha */}
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-md border border-border px-4 py-4">
              <div>
                <p className="text-sm font-medium">
                  Activar modo mantenimiento
                </p>
                <p className="text-xs text-muted-foreground">
                  Desactiva temporalmente el sistema para todos los usuarios
                  mientras realizas tareas administrativas.
                </p>
              </div>
              <Switch
                checked={modoMantenimiento}
                onCheckedChange={(checked) => setModoMantenimiento(checked)}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
