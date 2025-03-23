"use client";
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface StatusTabsProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const StatusTabs: React.FC<StatusTabsProps> = ({
  value,
  onValueChange,
}) => {
  return (
    <Tabs
      defaultValue="Activo"
      value={value}
      onValueChange={(newValue) => onValueChange(newValue)}
      className="w-[200px]"
    >
      <TabsList>
        <TabsTrigger value="Activo">Activos</TabsTrigger>
        <TabsTrigger value="Inactivo">Inactivos</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
