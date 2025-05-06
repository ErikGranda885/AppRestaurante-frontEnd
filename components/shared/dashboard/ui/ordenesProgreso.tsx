"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const ordenes = [
  {
    id: "A9",
    cliente: "Adam Hamzah",
    items: 8,
    estado: "Ready",
    subtitulo: "Ready to serve",
  },
  {
    id: "A5",
    cliente: "Nina Renard",
    items: 4,
    estado: "Ready",
    subtitulo: "Ready to serve",
  },
  {
    id: "A9",
    cliente: "Adam Hamzah",
    items: 8,
    estado: "Ready",
    subtitulo: "Ready to serve",
  },
  {
    id: "A5",
    cliente: "Nina Renard",
    items: 4,
    estado: "Ready",
    subtitulo: "Ready to serve",
  },
  {
    id: "A9",
    cliente: "Adam Hamzah",
    items: 8,
    estado: "Ready",
    subtitulo: "Ready to serve",
  },
  {
    id: "A5",
    cliente: "Nina Renard",
    items: 4,
    estado: "Ready",
    subtitulo: "Ready to serve",
  },
  {
    id: "A9",
    cliente: "Adam Hamzah",
    items: 8,
    estado: "Ready",
    subtitulo: "Ready to serve",
  },
  {
    id: "A5",
    cliente: "Nina Renard",
    items: 4,
    estado: "Ready",
    subtitulo: "Ready to serve",
  },
  {
    id: "A9",
    cliente: "Adam Hamzah",
    items: 8,
    estado: "Ready",
    subtitulo: "Ready to serve",
  },
  {
    id: "A5",
    cliente: "Nina Renard",
    items: 4,
    estado: "Ready",
    subtitulo: "Ready to serve",
  },

  {
    id: "A3",
    cliente: "Phillip Allen",
    items: 6,
    estado: "Ready",
    subtitulo: "Ready to serve",
  },
  {
    id: "TA",
    cliente: "Amanda Reid",
    items: 2,
    estado: "En progreso",
    subtitulo: "Cocinando ahora",
  },
  {
    id: "A6",
    cliente: "Mark Graham",
    items: 7,
    estado: "En progreso",
    subtitulo: "Cocinando ahora",
  },
  {
    id: "A12",
    cliente: "Abir Hussain",
    items: 6,
    estado: "En la cocina",
    subtitulo: "En la cocina",
  },
  {
    id: "A7",
    cliente: "Rachel Griffin",
    items: 5,
    estado: "En la cocina",
    subtitulo: "En la cocina",
  },
  {
    id: "A7",
    cliente: "Rachel Griffin",
    items: 5,
    estado: "En la cocina",
    subtitulo: "En la cocina",
  },
  {
    id: "A7",
    cliente: "Rachel Griffin",
    items: 5,
    estado: "En la cocina",
    subtitulo: "En la cocina",
  },
  {
    id: "A8",
    cliente: "Luis Torres",
    items: 3,
    estado: "Pendiente",
    subtitulo: "Pendiente confirmar pago",
  },
  {
    id: "A7",
    cliente: "Rachel Griffin",
    items: 5,
    estado: "En la cocina",
    subtitulo: "En la cocina",
  },
  {
    id: "A8",
    cliente: "Luis Torres",
    items: 3,
    estado: "Pendiente",
    subtitulo: "Pendiente confirmar pago",
  },
  {
    id: "A7",
    cliente: "Rachel Griffin",
    items: 5,
    estado: "En la cocina",
    subtitulo: "En la cocina",
  },
  {
    id: "A8",
    cliente: "Luis Torres",
    items: 3,
    estado: "Pendiente",
    subtitulo: "Pendiente confirmar pago",
  },
  {
    id: "A7",
    cliente: "Rachel Griffin",
    items: 5,
    estado: "En la cocina",
    subtitulo: "En la cocina",
  },
  {
    id: "A8",
    cliente: "Luis Torres",
    items: 3,
    estado: "Pendiente",
    subtitulo: "Pendiente confirmar pago",
  },
  {
    id: "A7",
    cliente: "Rachel Griffin",
    items: 5,
    estado: "En la cocina",
    subtitulo: "En la cocina",
  },
  {
    id: "A8",
    cliente: "Luis Torres",
    items: 3,
    estado: "Pendiente",
    subtitulo: "Pendiente confirmar pago",
  },
  {
    id: "A7",
    cliente: "Rachel Griffin",
    items: 5,
    estado: "En la cocina",
    subtitulo: "En la cocina",
  },
  {
    id: "A8",
    cliente: "Luis Torres",
    items: 3,
    estado: "Pendiente",
    subtitulo: "Pendiente confirmar pago",
  },
];

export default function OrdenesEnProceso() {
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState("En progreso");

  const ordenesFiltradas = ordenes.filter(
    (o) =>
      o.cliente.toLowerCase().includes(search.toLowerCase()) &&
      (filtro === "En progreso"
        ? o.estado === "En progreso" || o.estado === "En la cocina"
        : o.estado === "Pendiente"),
  );

  return (
    <Card className="h-full w-full border border-border px-1 dark:bg-[#1e1e1e] dark:text-white">
      <CardHeader className="space-y-2 py-5">
        <ToggleGroup
          type="single"
          value={filtro}
          onValueChange={(val: any) => val && setFiltro(val)}
          className="w-full border border-border rounded-md"
        >
          <ToggleGroupItem
            value="En progreso"
            className="h-14 w-1/2 rounded-l-lg text-sm data-[state=on]:bg-muted data-[state=on]:text-black dark:data-[state=on]:text-white"
          >
            En progreso
          </ToggleGroupItem>
          <ToggleGroupItem
            value="Pendiente"
            className="h-14 w-1/2 rounded-r-lg text-sm data-[state=on]:bg-muted data-[state=on]:text-black dark:data-[state=on]:text-white"
          >
            Pago pendiente
          </ToggleGroupItem>
        </ToggleGroup>

        <Input
          type="text"
          placeholder="Buscar orden..."
          className="mt-2 w-full text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </CardHeader>

      <CardContent className="h-[520px] p-0">
        <ScrollArea className="h-[509px] space-y-3 px-3 pr-4">
          {ordenesFiltradas.map((orden, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 transition hover:bg-muted/70"
            >
              <div className="flex items-center gap-3">
                <div className="w-[40px] rounded-md bg-black px-3 py-2 text-sm font-bold text-white shadow dark:bg-white dark:text-black">
                  {orden.id}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{orden.cliente}</span>
                  <span className="text-xs text-muted-foreground">
                    {orden.items} Items
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end text-xs">
                {orden.estado === "Ready" ? (
                  <>
                    <Badge className="bg-green-600 text-xs text-white hover:bg-green-700">
                      Ready
                    </Badge>
                    <span className="mt-1 text-green-400">
                      {orden.subtitulo}
                    </span>
                  </>
                ) : orden.estado === "Pendiente" ? (
                  <>
                    <Badge className="bg-yellow-500 text-xs text-white hover:bg-yellow-600">
                      Pendiente
                    </Badge>
                    <span className="mt-1 text-muted-foreground">
                      {orden.subtitulo}
                    </span>
                  </>
                ) : (
                  <>
                    <Badge className="bg-gray-600 text-xs text-white hover:bg-gray-700">
                      En progreso
                    </Badge>
                    <span className="mt-1 text-muted-foreground">
                      {orden.subtitulo}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
