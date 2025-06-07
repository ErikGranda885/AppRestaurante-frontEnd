"use client";
import { ColorRing } from "react-loader-spinner";

export default function Preloader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <ColorRing
          visible={true}
          height="80"
          width="80"
          ariaLabel="color-ring-loading"
          wrapperStyle={{}}
          wrapperClass="color-ring-wrapper"
          colors={["#f97316", "#ef4444", "#facc15", "#22c55e", "#3b82f6"]}

        />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Cargando, por favor espera...
        </p>
      </div>
    </div>
  );
}
