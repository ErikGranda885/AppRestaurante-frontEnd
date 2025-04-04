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
  // Propiedades para clases personalizadas
  contentClassName?: string; // Para modificar el ancho y/o alto
}

export function GeneralDialog({
  open,
  onOpenChange,
  triggerText,
  title,
  description,
  children,
  contentClassName,
}: GeneralDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-[#f6b100] text-black">{triggerText}</Button>
      </DialogTrigger>
      <DialogContent
        className={`border-border ${contentClassName ? contentClassName : "w-[500px]"} `}
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
