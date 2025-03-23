"use client";
import React from "react";
import { Button } from "@/components/ui/button";

export interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Paginator: React.FC<PaginatorProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="mt-4 flex items-center justify-center space-x-2">
      <Button onClick={handlePrevious} disabled={currentPage === 1}>
        Anterior
      </Button>
      {pages.map((page) => (
        <Button key={page} onClick={() => onPageChange(page)}>
          {page}
        </Button>
      ))}
      <Button onClick={handleNext} disabled={currentPage === totalPages}>
        Siguiente
      </Button>
    </div>
  );
};
