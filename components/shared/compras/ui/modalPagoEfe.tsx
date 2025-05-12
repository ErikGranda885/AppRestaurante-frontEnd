import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { safePrice } from "@/utils/format";
import { format } from "date-fns";
import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConfiguracionesVentas } from "@/hooks/configuraciones/generales/useConfiguracionesVentas";

interface ModalPagoEfectivoProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  efectivoRecibido: number | null;
  setEfectivoRecibido: (val: number) => void;
  total: number;
  orderItems: { name: string; qty: number; price: number }[];
  customerName: string;
  tableInfo: string;
}

export function ModalPagoEfectivo({
  open,
  onClose,
  onConfirm,
  efectivoRecibido,
  setEfectivoRecibido,
  total,
  orderItems,
  customerName,
  tableInfo,
}: ModalPagoEfectivoProps) {
  const teclas = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ","];
  const [inputEfectivo, setInputEfectivo] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { ventasConfig } = useConfiguracionesVentas();

  const botonesRapidos = [5, 10, 20, 50, 100];

  const calcularCambio = () => {
    if (efectivoRecibido !== null && efectivoRecibido >= total) {
      return efectivoRecibido - total;
    }
    return 0;
  };

  const handleTecla = (tecla: string) => {
    if (tecla === "," && inputEfectivo.includes(",")) return;
    const nuevo = inputEfectivo + tecla;
    setInputEfectivo(nuevo);
    if (!nuevo.endsWith(",")) {
      const valorNumerico = parseFloat(nuevo.replace(",", "."));
      if (!isNaN(valorNumerico)) {
        setEfectivoRecibido(valorNumerico);
      }
    }
  };

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="grid max-w-[700px] grid-cols-2 gap-6 border-border p-6">
        <DialogHeader className="col-span-2">
          <DialogTitle>Pago en efectivo</DialogTitle>
        </DialogHeader>

        {/* Panel izquierdo: estilo recibo */}
        <div className="flex flex-col justify-between rounded-lg border border-border bg-white p-4 text-sm shadow dark:bg-[#1a1a1a]">
          <div className="space-y-1">
            <p className="font-semibold text-gray-700 dark:text-white">
              Información del empleado
            </p>
            <p>{customerName}</p>
            <p className="text-xs text-gray-500">{tableInfo}</p>
            <p className="text-xs text-gray-500">
              {format(new Date(), "PPpp")}
            </p>
          </div>

          <div className="my-4 border-t border-dashed pt-2">
            <p className="mb-2 font-semibold text-gray-700 dark:text-white">
              Detalle de productos
            </p>
            <ScrollArea className="h-[81px] space-y-1">
              {orderItems.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="truncate">
                    {item.name} x{item.qty}
                  </span>
                  <span>
                    {safePrice(item.qty * item.price, ventasConfig.moneda)}
                  </span>
                </div>
              ))}
            </ScrollArea>

            <div className="mt-3 space-y-1 border-t pt-3 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-[#8c8c8c]">
                <span>
                  Items ({orderItems.reduce((sum, item) => sum + item.qty, 0)})
                </span>
                <span>
                  {safePrice(
                    orderItems.reduce(
                      (sum, item) => sum + item.qty * item.price,
                      0,
                    ),
                    ventasConfig.moneda,
                  )}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-[#8c8c8c]">
                <span>IVA ({ventasConfig.porcentaje_iva ?? 12}%)</span>
                <span>{safePrice(total * 0.15, ventasConfig.moneda)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-bold text-black dark:text-white">
                <span>Total</span>
                <span>{safePrice(total, ventasConfig.moneda)}</span>
              </div>
              <div className="flex justify-between pt-2 text-gray-800 dark:text-gray-300">
                <span>Recibido</span>
                <span>
                  {safePrice(efectivoRecibido ?? 0, ventasConfig.moneda)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-green-600 dark:text-green-400">
                <span>Cambio</span>
                <span>{safePrice(calcularCambio(), ventasConfig.moneda)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho: selector de monto */}
        <div className="flex flex-col justify-between">
          <div className="mt-6">
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.,]?[0-9]*"
              value={inputEfectivo}
              onChange={(e) => {
                const value = e.target.value;
                setInputEfectivo(value);
                const parsed = parseFloat(value.replace(",", "."));
                if (!isNaN(parsed)) {
                  setEfectivoRecibido(parsed);
                }
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  efectivoRecibido !== null &&
                  efectivoRecibido >= total &&
                  orderItems.length > 0
                ) {
                  onConfirm();
                }
              }}
              className="sr-only"
            />

            <div className="mb-2 text-center text-5xl font-bold">
              {safePrice(efectivoRecibido ?? 0, ventasConfig.moneda)}
            </div>

            <div className="mb-4 grid grid-cols-5 gap-2">
              {botonesRapidos.map((val) => (
                <Button
                  key={val}
                  variant="secondary"
                  onClick={() => {
                    setEfectivoRecibido(val);
                    setInputEfectivo(val.toString());
                  }}
                >
                  {safePrice(val, ventasConfig.moneda)}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {teclas.map((num, i) => (
                <Button
                  key={i}
                  variant="outline"
                  onClick={() => handleTecla(num)}
                  className="hover:bg-secondary"
                >
                  {num}
                </Button>
              ))}
            </div>

            <div className="mt-10">
              <Button
                variant="secondary"
                onClick={() => {
                  setInputEfectivo("");
                  setEfectivoRecibido(0);
                }}
                className="col-span-3 w-full"
              >
                Limpiar
              </Button>
              <Button
                onClick={() => {
                  if (
                    efectivoRecibido !== null &&
                    efectivoRecibido >= total &&
                    orderItems.length > 0
                  ) {
                    onConfirm();
                  }
                }}
                disabled={
                  efectivoRecibido === null ||
                  efectivoRecibido < total ||
                  orderItems.length === 0
                }
                className="col-span-3 mt-4 w-full text-lg font-bold"
              >
                Pagar Ahora
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
