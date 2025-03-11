"use client";
import * as React from "react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";

export interface ToastMessageProps {
  variant?: "default" | "destructive" | "success" | "warning";
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  buttonText?: string;
}

export function ToastMessage({
  variant = "default",
  title,
  description,
  actionText,
  onAction,
  buttonText = "Show Toast",
}: ToastMessageProps) {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const getToastStyle = () => {
    if (variant === "destructive") {
      return isDark ? "bg-red-700 text-white" : "bg-red-300 text-black";
    }
    if (variant === "success") {
      return isDark ? "bg-green-700 text-white" : "bg-green-300 text-black";
    }
    if (variant === "warning") {
      return isDark ? "bg-yellow-700 text-black" : "bg-yellow-300 text-black";
    }
    // default
    return isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-black";
  };

  const showToast = () => {
    toast.custom(
      ({ id, visible }) => (
        <div
          className={`p-4 rounded shadow-lg transition-opacity duration-300 ${
            visible ? "opacity-100" : "opacity-0"
          } ${getToastStyle()}`}
        >
          <div>
            <strong>{title}</strong>
          </div>
          {description && <div className="mt-1 text-sm">{description}</div>}
          {actionText && onAction && (
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onAction();
                  toast.dismiss(id);
                }}
              >
                {actionText}
              </Button>
            </div>
          )}
        </div>
      ),
      { duration: 5000 }
    );
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={showToast}
      >
        {buttonText}
      </Button>
      <Toaster
        position="bottom-right"
        className="p-4 z-50"
      />
    </>
  );
}
