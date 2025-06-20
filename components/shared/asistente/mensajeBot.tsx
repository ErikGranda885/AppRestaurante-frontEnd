import React from "react";

interface MensajeBotProps {
  children: React.ReactNode;
}

export function MensajeBot({ children }: MensajeBotProps) {
  return (
    <div className="mr-auto max-w-[100%] self-start rounded-xl bg-neutral-200 px-3 py-2 text-sm text-black shadow  dark:bg-neutral-800 dark:text-neutral-200">
      {children}
    </div>
  );
}
