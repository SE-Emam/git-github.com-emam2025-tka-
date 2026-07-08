import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/src/lib/utils';

interface VirtualizedListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  height?: number; // Default to full screen or parent if not provided
  itemHeight: number;
  className?: string;
}

export function VirtualizedList<T>({ data, renderItem, height = 500, itemHeight, className }: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 5, // Render extra items for smooth scroll
  });

  return (
    <div
      ref={parentRef}
      className={cn("overflow-auto momentum-scroll", className)}
      style={{ height: `${height}px` }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderItem(data[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
