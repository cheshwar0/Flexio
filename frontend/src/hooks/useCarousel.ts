import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCarouselProps {
  totalItems: number;
  cardsPerView?: number;
  intervalMs?: number;
  autoPlay?: boolean;
}

export function useCarousel({
  totalItems,
  cardsPerView = 4,
  intervalMs = 5000,
  autoPlay = true,
}: UseCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<any>(null);

  // Maximum valid starting index so that we don't display empty slots at the end if not looped
  // If totalItems <= cardsPerView, only 1 page is needed and no scrolling is required
  const maxIndex = Math.max(0, totalItems - cardsPerView);
  const totalSlides = maxIndex > 0 ? maxIndex + 1 : 1;

  const next = useCallback(() => {
    if (totalItems <= cardsPerView) return;
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [totalItems, cardsPerView, maxIndex]);

  const prev = useCallback(() => {
    if (totalItems <= cardsPerView) return;
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [totalItems, cardsPerView, maxIndex]);

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, maxIndex));
      setCurrentIndex(clamped);
    },
    [maxIndex]
  );

  useEffect(() => {
    // If not enough items to scroll or autoplay is disabled, clear timer
    if (!autoPlay || totalItems <= cardsPerView || isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Set up clean 5000ms interval
    timerRef.current = setInterval(() => {
      next();
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [autoPlay, totalItems, cardsPerView, intervalMs, isPaused, next]);

  return {
    currentIndex,
    totalSlides,
    maxIndex,
    next,
    prev,
    goTo,
    setIsPaused,
  };
}
