"use client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export interface GeneralDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerText?: React.ReactNode;
  triggerVariant?: "outline" | "ghost" | "primary" | "secondary";
  title?: React.ReactNode; // 🔁 ahora es opcional
  description?: React.ReactNode;
  submitText?: React.ReactNode;
  onSubmit?: () => void;
  children?: React.ReactNode;
  contentClassName?: string;
  contentWidth?: string;
  contentHeight?: string;
}

export function GeneralDialog({
  open,
  onOpenChange,
  triggerText,
  triggerVariant = "primary",
  title,
  description,
  children,
  contentClassName,
  contentWidth,
  contentHeight,
}: GeneralDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerText && (
        <DialogTrigger asChild>
          <Button
            variant={triggerVariant}
            className="inline-flex h-9 w-auto items-center justify-center gap-2 whitespace-nowrap text-xs font-medium sm:w-auto sm:px-4 sm:text-sm sm:font-semibold"
          >
            {triggerText}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        className={`border-border ${contentClassName ?? "w-[500px] max-w-none"}`}
        style={{
          width: contentWidth,
          height: contentHeight,
        }}
      >
        <DialogHeader>
          {title ? (
            <DialogTitle>{title}</DialogTitle>
          ) : (
            <DialogTitle>
              <VisuallyHidden>Título del diálogo</VisuallyHidden>
            </DialogTitle>
          )}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="grid gap-4 py-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
