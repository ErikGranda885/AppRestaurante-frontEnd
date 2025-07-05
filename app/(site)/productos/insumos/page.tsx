"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";

// Importa tu formulario original
import { FormProducts } from "@/components/shared/productos/formularios/createProductForm";

export default function TestProductFormPage() {
  const [open, setOpen] = React.useState(false);

  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Test Modal"
      breadcrumbPageTitle="Test Modal Page"
      submenu={false}
      isLoading={false}
    >
      <div className="flex min-h-[60vh] items-center justify-center">
        <Button onClick={() => setOpen(true)}>
          Abrir Modal con FormProducts
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[700px] max-w-none border-border">
          <DialogHeader>
            <DialogTitle>Test: Crear Producto</DialogTitle>
            <DialogDescription>
              Prueba el formulario con el Combobox dentro de un modal limpio.
            </DialogDescription>
          </DialogHeader>
          <FormProducts
            onSuccess={() => {
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </ModulePageLayout>
  );
}
