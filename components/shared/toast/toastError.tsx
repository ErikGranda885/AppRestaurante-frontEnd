import React from "react";
import { XCircle } from "lucide-react";
import toast from "react-hot-toast";

export type ToastErrorProps = {
  message: string;
  duration?: number;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
};

export const ToastError = ({
  message,
  duration = 3000,
  position = "top-right",
}: ToastErrorProps) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } relative flex w-96 items-start gap-3 rounded-lg border border-red-400 bg-red-50 p-4 shadow-lg`}
        style={{ animationDuration: "3s" }}
      >
        <XCircle className="mt-1 h-6 w-6 text-red-500" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-500">
            Mensaje Informativo
          </p>
          <p className="text-sm text-red-500/80">{message}</p>
        </div>
        <div className="absolute bottom-0 left-0 h-[3px] w-full bg-red-400/20">
          <div className="progress-bar h-full bg-red-400" />
        </div>
      </div>
    ),
    { duration, position },
  );
};
