// app/components/ModuleSkeleton.tsx
"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </div>
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>
    </div>
  );
}
