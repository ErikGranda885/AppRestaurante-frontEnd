import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface GeneralDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerText: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  submitText?: React.ReactNode;
  onSubmit?: () => void;
  children?: React.ReactNode;
  // Propiedades para modificar el tamaño del DialogContent
  contentClassName?: string; // Clases personalizadas (opcional)
  contentWidth?: string; // Ejemplo: "500px" o "90%"
  contentHeight?: string; // Ejemplo: "auto" o "600px"
}

export function GeneralDialog({
  open,
  onOpenChange,
  triggerText,
  title,
  description,
  children,
  contentClassName,
  contentWidth,
  contentHeight,
}: GeneralDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="text-[12px] font-semibold">{triggerText}</Button>
      </DialogTrigger>
      <DialogContent
        className={`border-border ${contentClassName ? contentClassName : "w-[500px] max-w-none"}`}
        style={{
          width: contentWidth || undefined,
          height: contentHeight || undefined,
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="grid gap-4 py-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
