import React from "react";
import { CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export type ToastSuccessProps = {
  message: string;
  duration?: number;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
};

export const ToastSuccess = ({
  message,
  duration = 2000,
  position = "top-right",
}: ToastSuccessProps) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } relative flex w-96 items-start gap-3 rounded-lg border border-[#4ADE80] bg-[#F0FFF4] p-4 shadow-lg`}
        style={{ animationDuration: "3s" }}
      >
        <CheckCircle className="mt-1 h-6 w-6 text-[#166534]" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#166534]">
            Mensaje Informativo
          </p>
          <p className="text-sm text-[#166534]/80">{message}</p>
        </div>
        <div className="absolute bottom-0 left-0 h-[3px] w-full bg-[#4ADE80]/20">
          <div className="progress-bar h-full bg-[#4ADE80]" />
        </div>
      </div>
    ),
    { duration, position },
  );
};
