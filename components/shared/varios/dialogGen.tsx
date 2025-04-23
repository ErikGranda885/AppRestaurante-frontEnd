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

export interface GeneralDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerText?: React.ReactNode;
  triggerVariant?: "outline" | "ghost" | "primary" | "secondary";
  title: React.ReactNode;
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
            className="text-[12px] font-semibold"
            variant={triggerVariant}
          >
            {triggerText}
          </Button>
        </DialogTrigger>
      )}
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
