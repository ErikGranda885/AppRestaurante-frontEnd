"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRef } from "react";

interface ValidarPagoDialogProps {
  open: boolean;
  onClose: () => void;
  venta: {
    id_vent: number;
    comprobante: string;
    imagen: string;
  };
  onConfirm: (id_vent: number) => void;
}

export function ValidarPagoDialog({
  open,
  onClose,
  venta,
  onConfirm,
}: ValidarPagoDialogProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const img = imgRef.current;
    if (!img) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    img.style.transformOrigin = `${x}% ${y}%`;
    img.style.transform = "scale(2)";
  };

  const handleMouseLeave = () => {
    const img = imgRef.current;
    if (img) {
      img.style.transformOrigin = "center";
      img.style.transform = "scale(1)";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl border-border">
        <DialogHeader>
          <DialogTitle>Validar Comprobante</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm">
            Comprobante N°: <strong>{venta.comprobante}</strong>
          </p>
          <div
            className="group relative h-[400px] w-full overflow-hidden rounded-md border-2 border-border bg-white dark:bg-[#1a1a1a]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <Image
              ref={imgRef}
              src={venta.imagen}
              alt="Comprobante"
              fill
              sizes="100%"
              className="object-contain p-2 transition-transform duration-300 ease-in-out"
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm(venta.id_vent)}>Aceptar pago</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
