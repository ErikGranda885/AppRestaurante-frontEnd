"use client";
import * as React from "react";
import { Combobox } from "@/components/shared/combobox";
import { IRol } from "@/lib/types";

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
  className,
}) => {
  const extendedItems = [
    ...items.map((role) => ({
      value: String(role.id_rol),
      label: role.nom_rol,
    })),
    { value: "__create__", label: "Crear nuevo rol" },
  ];

  return (
    <Combobox
      items={extendedItems}
      value={value}
      onChange={(newValue) => {
        const valueStr = newValue.toString();
        if (valueStr === "__create__") {
          onCreateRole();
        } else {
          onChange(valueStr);
        }
      }}
      placeholder={placeholder}
      className={className }
    />
  );
};
