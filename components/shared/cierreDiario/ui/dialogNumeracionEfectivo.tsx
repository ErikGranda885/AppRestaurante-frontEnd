import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ToastError } from "@/components/shared/toast/toastError"; // Asegúrate de tener esto
import { ToastSuccess } from "../../toast/toastSuccess";
import { useRouter } from "next/navigation";

const denominaciones = [
  { label: "0.01", valor: 0.01, tipo: "moneda" },
  { label: "0.05", valor: 0.05, tipo: "moneda" },
  { label: "0.10", valor: 0.1, tipo: "moneda" },
  { label: "0.25", valor: 0.25, tipo: "moneda" },
  { label: "0.50", valor: 0.5, tipo: "moneda" },
  { label: "1.00", valor: 1, tipo: "moneda" },
  { label: "5", valor: 5, tipo: "billete" },
  { label: "10", valor: 10, tipo: "billete" },
  { label: "20", valor: 20, tipo: "billete" },
  { label: "50", valor: 50, tipo: "billete" },
  { label: "100", valor: 100, tipo: "billete" },
];

export function DialogNumeracionEfectivo({
  open,
  onOpenChange,
  onGuardar,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGuardar: (total: number) => void;
}) {
  const [cantidades, setCantidades] = useState<{ [key: string]: number }>({});
  const [total, setTotal] = useState(0);
  const router = useRouter();
  useEffect(() => {
    let suma = 0;
    for (const d of denominaciones) {
      const cantidad = cantidades[d.label] || 0;
      suma += cantidad * d.valor;
    }
    setTotal(suma);
  }, [cantidades]);

  const handleCantidadChange = (denominacion: string, valor: string) => {
    const cantidad = parseInt(valor);
    setCantidades({
      ...cantidades,
      [denominacion]: isNaN(cantidad) ? 0 : cantidad,
    });
  };

  const handleGuardar = () => {
    const hayAlMenosUno = Object.values(cantidades).some((v) => v > 0);
    if (!hayAlMenosUno) {
      ToastError({
        message: "Debes ingresar al menos una cantidad mayor a 0.",
      });
      return;
    }
    ToastSuccess({
      message: "Efectivo registrado exitosamente",
    });
    onGuardar(total);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[700px] max-w-none border-border dark:bg-[#262626]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>🧾 Detalle del efectivo del día</DialogTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Ingresa la cantidad de monedas y billetes disponibles para calcular
            el total en caja.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
          {/* Monedas */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Monedas</h3>
            <div className="space-y-2">
              {denominaciones
                .filter((d) => d.tipo === "moneda")
                .map((d) => (
                  <div
                    key={d.label}
                    className="grid grid-cols-3 items-center gap-2 text-sm"
                  >
                    <span className="text-muted-foreground">${d.label}</span>
                    <Input
                      type="number"
                      className="w-full border border-border dark:border-white"
                      min={0}
                      value={cantidades[d.label] || ""}
                      onChange={(e) =>
                        handleCantidadChange(d.label, e.target.value)
                      }
                    />
                    <span className="text-right font-semibold">
                      ${(Number(cantidades[d.label] || 0) * d.valor).toFixed(2)}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Separador vertical */}
          <div className="mx-4 w-px bg-border dark:bg-white/20" />

          {/* Billetes */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Billetes</h3>
            <div className="space-y-2">
              {denominaciones
                .filter((d) => d.tipo === "billete")
                .map((d) => (
                  <div
                    key={d.label}
                    className="grid grid-cols-3 items-center gap-2 text-sm"
                  >
                    <span className="text-muted-foreground">${d.label}</span>
                    <Input
                      type="number"
                      className="w-full border border-border dark:border-white"
                      min={0}
                      value={cantidades[d.label] || ""}
                      onChange={(e) =>
                        handleCantidadChange(d.label, e.target.value)
                      }
                    />
                    <span className="text-right font-semibold">
                      ${(Number(cantidades[d.label] || 0) * d.valor).toFixed(2)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between border-t pt-4 text-sm font-semibold">
          <span>Total Efectivo:</span>
          <span className="">${total.toFixed(2)}</span>
        </div>

        <DialogFooter className="pt-4">
          <Button
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancelar
          </Button>

          <Button onClick={handleGuardar}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
