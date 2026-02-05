import { useRef, useCallback, TouchEvent } from 'react';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
}

/**
 * Hook for swipe navigation between pages
 * - Swipe left: next page
 * - Swipe right: previous page
 * - Excludes elements with data-swipe-ignore attribute
 */
export function useSwipeNavigation(config: SwipeConfig): SwipeHandlers {
  const { onSwipeLeft, onSwipeRight, threshold = 50 } = config;
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    // Check if target or any ancestor has data-swipe-ignore
    let target = e.target as HTMLElement | null;
    while (target) {
      if (target.dataset?.swipeIgnore !== undefined) {
        touchStartRef.current = null;
        return;
      }
      target = target.parentElement;
    }

    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Only trigger if horizontal movement > vertical movement
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      if (deltaX < 0 && onSwipeLeft) {
        // Swipe left -> next page
        onSwipeLeft();
      } else if (deltaX > 0 && onSwipeRight) {
        // Swipe right -> previous page
        onSwipeRight();
      }
    }

    touchStartRef.current = null;
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return { onTouchStart, onTouchEnd };
}
