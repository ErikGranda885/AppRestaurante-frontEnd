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
}

export function GeneralDialog({
  open,
  onOpenChange,
  triggerText,
  title,
  description,
  children,
}: GeneralDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogTrigger asChild>
        <Button
          variant={"primary"}
          className="bg-primary-500 text-white dark:text-white "
        >
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] dark:border dark:border-default-700 dark:bg-[#09090b] dark:text-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="grid gap-4 py-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
