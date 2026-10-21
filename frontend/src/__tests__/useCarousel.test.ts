import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCarousel } from '../hooks/useCarousel.js';

describe('useCarousel Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with index 0 and calculates correct total slides', () => {
    const { result } = renderHook(() =>
      useCarousel({ totalItems: 10, cardsPerView: 4, intervalMs: 5000 })
    );

    expect(result.current.currentIndex).toBe(0);
    // 10 items with 4 per view: maxIndex = 6, totalSlides = 7
    expect(result.current.maxIndex).toBe(6);
    expect(result.current.totalSlides).toBe(7);
  });

  it('automatically advances every 5 seconds (5000ms)', () => {
    const { result } = renderHook(() =>
      useCarousel({ totalItems: 10, cardsPerView: 4, intervalMs: 5000 })
    );

    expect(result.current.currentIndex).toBe(0);

    // Fast-forward 5000ms
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.currentIndex).toBe(1);

    // Fast-forward another 5000ms
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.currentIndex).toBe(2);
  });

  it('loops continuously back to index 0 when reaching the end', () => {
    const { result } = renderHook(() =>
      useCarousel({ totalItems: 6, cardsPerView: 4, intervalMs: 5000 })
    );

    // maxIndex is 6 - 4 = 2.
    // Index 0 -> 5s -> Index 1 -> 5s -> Index 2 -> 5s -> Index 0
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.currentIndex).toBe(1);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.currentIndex).toBe(2);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.currentIndex).toBe(0);
  });

  it('cleans up interval timer when component unmounts', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
    const { unmount } = renderHook(() =>
      useCarousel({ totalItems: 10, cardsPerView: 4, intervalMs: 5000 })
    );

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('supports single-image spotlight mode (cardsPerView: 1) cycling through all 10 items', () => {
    const { result } = renderHook(() =>
      useCarousel({ totalItems: 10, cardsPerView: 1, intervalMs: 5000 })
    );

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.totalSlides).toBe(10);

    // Step through indices 1, 2, 3...
    for (let i = 1; i < 10; i++) {
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(result.current.currentIndex).toBe(i);
    }

    // After index 9, wraps back to index 0 (Rank 1)
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.currentIndex).toBe(0);
  });
});
