"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useConfiguracionesVentas } from "@/hooks/configuraciones/generales/useConfiguracionesVentas";
import { ToastSuccess } from "../../toast/toastSuccess";

export function VentasConfiguracion() {
  const { ventasConfig, setVentasConfig, updateConfiguracion, loading } =
    useConfiguracionesVentas();

  const handleInputChange = (key: string, value: string | number) => {
    setVentasConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleCancel = () => {
    window.location.reload();
  };

  const handleSave = async () => {
    await updateConfiguracion("porcentaje_iva", ventasConfig.porcentaje_iva);
    await updateConfiguracion("moneda", ventasConfig.moneda);
    await updateConfiguracion(
      "minimo_stock_alerta",
      ventasConfig.minimo_stock_alerta,
    );

    ToastSuccess({
      message: "Configuración de ventas guardada correctamente.",
    });
  };

  if (loading) return <div>Cargando configuración de ventas...</div>;

  return (
    <div className="space-y-8">
      <Card className="border border-border bg-background p-6 pb-10 shadow-sm">
        <h3 className="text-lg font-semibold">Configuración de Ventas</h3>
        <p className="text-sm text-muted-foreground">
          Personaliza las opciones y reglas para las ventas del restaurante.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col justify-between space-y-4">
            {/* Porcentaje IVA */}
            <div>
              <Label>Porcentaje de IVA (%)</Label>
              <Input
                type="number"
                value={ventasConfig.porcentaje_iva ?? ""}
                onChange={(e) =>
                  handleInputChange(
                    "porcentaje_iva",
                    e.target.value === ""
                      ? ""
                      : parseFloat(e.target.value),
                  )
                }
              />
            </div>

            {/* Moneda */}
            <div>
              <Label>Moneda</Label>
              <select
                value={ventasConfig.moneda ?? ""}
                onChange={(e) =>
                  handleInputChange("moneda", e.target.value)
                }
                className="mt-1 block w-full rounded-md border border-input bg-background p-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">-- selecciona una moneda --</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="PEN">PEN (S/)</option>
                <option value="MXN">MXN (MX$)</option>
                <option value="COP">COP (COL$)</option>
              </select>
            </div>

            {/* Mínimo stock alerta */}
            <div>
              <Label>Mínimo de stock para alerta</Label>
              <Input
                type="number"
                value={ventasConfig.minimo_stock_alerta ?? ""}
                onChange={(e) =>
                  handleInputChange(
                    "minimo_stock_alerta",
                    e.target.value === ""
                      ? ""
                      : parseInt(e.target.value, 10),
                  )
                }
              />
            </div>
          </div>

          {/* Si quieres agregar más switches, siguen la misma lógica: valor ?? "" */}
        </div>
      </Card>

      <div className="mt-6 flex items-center justify-end space-x-4">
        <Button variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>Guardar</Button>
      </div>
    </div>
  );
}
