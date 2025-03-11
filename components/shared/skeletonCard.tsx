// app/components/ModuleSkeleton.tsx
"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
        <div className="aspect-video rounded-xl bg-muted/50">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
        <div className="aspect-video rounded-xl bg-muted/50">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>
    </div>
  );
}
