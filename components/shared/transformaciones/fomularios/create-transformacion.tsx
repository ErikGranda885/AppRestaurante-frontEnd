"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { SERVICIOS_RECETAS } from "@/services/recetas.service";
import { SERVICIOS_TRANSFORMACIONES } from "@/services/transformaciones.service";
import Image from "next/image";
import { ToastSuccess } from "../../toast/toastSuccess";
import { ToastError } from "../../toast/toastError";

export function FormTransformacion({
  onSuccess,
  onClose,
}: {
  onSuccess?: () => void;
  onClose?: () => void;
}) {
  const [recetas, setRecetas] = useState<any[]>([]);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecetas = async () => {
      try {
        const res = await fetch(SERVICIOS_RECETAS.listar);
        const data = await res.json();
        setRecetas(data);
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar recetas");
      }
    };
    fetchRecetas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recetaSeleccionada || !cantidad) {
      toast.warning("Completa todos los campos");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        rece_trans: parseInt(recetaSeleccionada),
        cant_prod_trans: parseFloat(cantidad),
        usu_trans: 1,
      };

      const res = await fetch(SERVICIOS_TRANSFORMACIONES.crear, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json(); // 👈 obtener mensaje del backend
        throw new Error(
          errorData.message || "Error al registrar transformación",
        );
      }

      ToastSuccess({
        message: "Transformación registrada correctamente",
      });
      if (onSuccess) onSuccess();

      setCantidad("");
      setRecetaSeleccionada("");
    } catch (err: any) {
      ToastError({
        message: err.message || "Error al registrar transformación",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label>Receta</Label>
        <Select
          onValueChange={setRecetaSeleccionada}
          value={recetaSeleccionada}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una receta" />
          </SelectTrigger>
          <SelectContent>
            {recetas.map((rec: any) => (
              <SelectItem
                key={rec.id_rec}
                value={String(rec.id_rec)}
                className="flex items-center gap-2 py-2"
              >
                <div className="flex gap-2">
                  <div className="relative h-6 w-6 overflow-hidden rounded">
                    <Image
                      src={rec.prod_rec?.img_prod}
                      alt={rec.prod_rec?.nom_prod || "Producto"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span>{rec.prod_rec?.nom_prod || "Sin producto"}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Cantidad a producir</Label>
        <Input
          type="number"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          placeholder="Ej. 10"
          min="1"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() => {
            setCantidad("");
            setRecetaSeleccionada("");
            if (onClose) onClose();
          }}
        >
          Cancelar
        </Button>

        <Button type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrar"}
        </Button>
      </div>
    </form>
  );
}
