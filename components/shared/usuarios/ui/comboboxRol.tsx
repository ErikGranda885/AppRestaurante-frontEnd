"use client";

import React, { useRef } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { IRol } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface RoleComboboxProps {
  items: IRol[];
  value: string;
  onChange: (value: string) => void;
  onCreateRole: () => void;
  placeholder?: string;
  className?: string;
}

export const RoleCombobox: React.FC<RoleComboboxProps> = ({
  items,
  value,
  onChange,
  onCreateRole,
  placeholder = "Selecciona un rol",
  className = "",
}) => {
  const triggerRef = useRef<HTMLButtonElement>(null);

  const roleOptions = items.map((role) => ({
    value: String(role.id_rol),
    label: role.nom_rol,
  }));

  const getLabel = (val: string) =>
    roleOptions.find((o) => o.value === val)?.label ?? placeholder;

  return (
    <div className="flex flex-col">
      <div className="flex gap-2">
        <Select
          value={value || ""}
          onValueChange={onChange}
        >
          <SelectTrigger
            ref={triggerRef}
            className={cn("w-full justify-between", className)}
          >
            <span>{getLabel(value)}</span>
          </SelectTrigger>
          <SelectContent className="max-h-72 overflow-auto">
            {roleOptions.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No hay roles disponibles.
              </div>
            )}
            {roleOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="font-medium">{opt.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Botón para abrir el modal de creación */}
        <Button
          type="button"
          variant="outline"
          className="flex-shrink-0 px-2"
          onClick={onCreateRole}
          title="Crear nuevo rol"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
