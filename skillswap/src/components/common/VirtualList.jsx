import { memo, useEffect, useRef, useState, useCallback } from "react";

/**
 * VirtualList component for rendering large lists efficiently
 * Only renders items that are visible in the viewport
 */
const VirtualList = memo(
  ({
    items,
    itemHeight = 100,
    overscan = 3,
    renderItem,
    className = "",
    containerHeight = 600,
  }) => {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef(null);

    const handleScroll = useCallback((e) => {
      setScrollTop(e.target.scrollTop);
    }, []);

    // Calculate visible range
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan
    );
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItems = items.slice(startIndex, endIndex);
    const offsetY = startIndex * itemHeight;
    const totalHeight = items.length * itemHeight;

    return (
      <div
        ref={containerRef}
        className={`overflow-auto ${className}`}
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleItems.map((item, index) =>
              renderItem(item, startIndex + index)
            )}
          </div>
        </div>
      </div>
    );
  }
);

VirtualList.displayName = "VirtualList";

export default VirtualList;
