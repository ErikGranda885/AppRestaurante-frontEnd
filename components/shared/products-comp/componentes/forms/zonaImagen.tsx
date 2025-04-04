import React from "react";
import Image from "next/image";

interface ZonaImagenProps {
  imageFile: File | null;
  imagePreview: string;
  setImageFile: (file: File | null) => void;
  setImagePreview: (preview: string) => void;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  handleImageSelect: () => void;
  handleImageDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const ZonaImagen: React.FC<ZonaImagenProps> = ({
  imagePreview,
  setImageFile,
  setImagePreview,
  imageInputRef,
  handleImageSelect,
  handleImageDrop,
  handleDragOver,
}) => (
  <div className="flex flex-col items-center justify-center space-y-6">
    <label className="block text-sm font-medium ">
      Imagen del Producto
    </label>
    <input
      type="file"
      ref={imageInputRef}
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
        }
      }}
      style={{ display: "none" }}
      accept="image/*"
    />
    <div
      onClick={handleImageSelect}
      onDrop={handleImageDrop}
      onDragOver={handleDragOver}
      className="flex h-64 w-full max-w-xs cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-gray-300 p-4 text-gray-500 dark:border-gray-500"
    >
      {imagePreview ? (
        <Image
          src={imagePreview}
          alt="Previsualización"
          width={200}
          height={200}
          className="object-contain"
        />
      ) : (
        <span>Suelta la imagen aquí o haz clic para seleccionar</span>
      )}
    </div>
  </div>
);
