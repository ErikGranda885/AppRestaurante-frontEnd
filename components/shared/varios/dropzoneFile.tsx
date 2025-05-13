"use client";
import React, { useRef, useState } from "react";

interface DropzoneFileProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  multiple?: boolean;
  text?: string;
}

export const DropzoneFile: React.FC<DropzoneFileProps> = ({
  onFileSelect,
  accept = ".csv, .xlsx",
  multiple = false,
  text = "Arrastra y suelta aquí o haz clic para seleccionar un archivo",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if (multiple) {
      Array.from(files).forEach((file) => onFileSelect(file));
    } else {
      onFileSelect(files[0]);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files) return;
    if (multiple) {
      Array.from(files).forEach((file) => onFileSelect(file));
    } else {
      onFileSelect(files[0]);
    }
    e.dataTransfer.clearData();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
      />
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-6 ${
          isDragging
            ? "border-blue-500"
            : "border-gray-300 hover:border-gray-400"
        } dark:border-default-700 dark:text-white dark:hover:border-gray-500`}
      >
        <p className="text-center text-sm text-muted-foreground">{text}</p>
      </div>
    </>
  );
};
