"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ModalInactividadProps {
  open: boolean;
  contador: number;
  onCancelar: () => void;
}

export const ModalInactividad: React.FC<ModalInactividadProps> = ({
  open,
  contador,
  onCancelar,
}) => {
  return (
    <Dialog open={open}>
      <DialogContent className="animate-fade-in rounded-2xl bg-white text-center shadow-xl dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-red-600 dark:text-red-400">
            ¡Sesión por cerrar!
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-muted-foreground"
        >
          <p className="mb-2">Por inactividad, tu sesión se cerrará en:</p>
          <p className="text-2xl font-bold text-black dark:text-white">
            {contador}s
          </p>
        </motion.div>

        <Button
          className="mt-4 bg-green-600 text-white hover:bg-green-700"
          onClick={onCancelar}
        >
          Seguir conectado
        </Button>
      </DialogContent>
    </Dialog>
  );
};
