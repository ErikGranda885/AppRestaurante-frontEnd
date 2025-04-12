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
}) => {
  // Constantes de validación
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB en bytes
  const MIN_WIDTH = 200;
  const MIN_HEIGHT = 200;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar el tamaño de la imagen
    if (file.size > MAX_SIZE) {
      alert("La imagen excede el tamaño máximo de 2MB.");
      return;
    }

    // Crear una URL para validar las dimensiones
    const objectUrl = URL.createObjectURL(file);
    // Usamos window.Image para evitar conflictos con el componente Image importado
    const img = new window.Image();
    img.src = objectUrl;
    img.onload = () => {
      if (img.naturalWidth < MIN_WIDTH || img.naturalHeight < MIN_HEIGHT) {
        alert(
          "La imagen es demasiado pequeña. Asegúrate de que tenga un tamaño mínimo de 200x200px.",
        );
        URL.revokeObjectURL(objectUrl);
        return;
      }
      // Si las validaciones pasan, actualiza el estado
      setImageFile(file);
      setImagePreview(objectUrl);
    };
    img.onerror = () => {
      alert("Error al cargar la imagen. Inténtalo de nuevo.");
      URL.revokeObjectURL(objectUrl);
    };
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <label className="block text-sm font-medium">Imagen del Producto</label>
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleFileChange}
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
          <span className="text-center text-gray-500 dark:text-gray-400">
            La imagen debe tener un tamaño de 200x200px o mayor y un peso máximo
            de 2MB.
            <br />
            Arrastra y suelta la imagen aquí o{" "}
            <span
              className="cursor-pointer text-blue-500 underline"
              onClick={handleImageSelect}
            >
              selecciona una imagen
            </span>
          </span>
        )}
      </div>
    </div>
  );
};
