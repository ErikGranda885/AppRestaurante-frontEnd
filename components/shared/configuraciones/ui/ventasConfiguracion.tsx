"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function VentasConfiguracion() {
  const [formData, setFormData] = useState({
    porcentaje_iva: 12,
    moneda: "USD",
    minimo_stock_alerta: 5,
    mostrar_stock_negativo: false,
    permitir_venta_sin_cierre: false,
    habilitar_qr_pago_inmediato: false,
  });

  const handleInputChange = (key: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSwitchChange = (key: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCancel = () => {};
  const handleSave = () => {};

  return (
    <div className="space-y-8">
      <Card className="border border-border bg-background p-6 pb-10 shadow-sm">
        <h3 className="text-lg font-semibold">Configuración de Ventas</h3>
        <p className="text-sm text-muted-foreground">
          Personaliza las opciones y reglas para las ventas del restaurante.
        </p>

        {/* Grid 2 columnas */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Inputs izquierda */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <Label>Porcentaje de IVA (%)</Label>
              <Input
                type="number"
                value={formData.porcentaje_iva}
                onChange={(e) =>
                  handleInputChange(
                    "porcentaje_iva",
                    parseFloat(e.target.value),
                  )
                }
              />
            </div>

            <div>
              <Label>Moneda</Label>
              <select
                value={formData.moneda}
                onChange={(e) => handleInputChange("moneda", e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background p-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="PEN">PEN (S/)</option>
                <option value="MXN">MXN (MX$)</option>
                <option value="COP">COP (COL$)</option>
              </select>
            </div>

            <div>
              <Label>Mínimo de stock para alerta</Label>
              <Input
                type="number"
                value={formData.minimo_stock_alerta}
                onChange={(e) =>
                  handleInputChange(
                    "minimo_stock_alerta",
                    parseInt(e.target.value),
                  )
                }
              />
            </div>
          </div>

          {/* Switches derecha (alineado vertical) */}
          <div className="flex flex-col justify-between space-y-6 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Permitir ventas sin cierre
                </p>
                <p className="text-xs text-muted-foreground">
                  Permite registrar ventas aunque el cierre diario no se haya
                  realizado.
                </p>
              </div>
              <Switch
                checked={formData.permitir_venta_sin_cierre}
                onCheckedChange={(checked) =>
                  handleSwitchChange("permitir_venta_sin_cierre", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Mostrar stock negativo</p>
                <p className="text-xs text-muted-foreground">
                  Permite vender productos aunque el stock disponible sea menor
                  o igual a cero.
                </p>
              </div>
              <Switch
                checked={formData.mostrar_stock_negativo}
                onCheckedChange={(checked) =>
                  handleSwitchChange("mostrar_stock_negativo", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Habilitar QR de pago inmediato
                </p>
                <p className="text-xs text-muted-foreground">
                  Genera un QR en la factura para que el cliente pueda pagar su
                  orden directamente desde su celular.
                </p>
              </div>
              <Switch
                checked={formData.habilitar_qr_pago_inmediato}
                onCheckedChange={(checked) =>
                  handleSwitchChange("habilitar_qr_pago_inmediato", checked)
                }
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Botones acción */}
      <div className="mt-6 flex items-center justify-end space-x-4">
        <Button variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>Guardar</Button>
      </div>
    </div>
  );
}
