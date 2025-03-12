import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
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
}

export function GeneralDialog({
  open,
  onOpenChange,
  triggerText,
  title,
  description,
  submitText = "Submit",
  onSubmit,
  children,
}: GeneralDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogTrigger asChild>
        <Button variant="outline">{triggerText}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="grid gap-4 py-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
