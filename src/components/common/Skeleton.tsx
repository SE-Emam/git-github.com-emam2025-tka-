import React from 'react';
import { cn } from '@/src/lib/utils';

interface SkeletonProps {
  className?: string;
  count?: number;
  static?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, count = 1, static: isStatic = false }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-md bg-slate-200 dark:bg-slate-800",
            !isStatic && "animate-pulse will-change-[opacity]",
            className
          )}
        />
      ))}
    </>
  );
};
