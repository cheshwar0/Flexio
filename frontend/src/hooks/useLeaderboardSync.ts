import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchCurrentDisplay } from '../services/displayService.js';
import { DisplayResponse } from '../types/index.js';

interface UseLeaderboardSyncOptions {
  refreshIntervalMs?: number;
}

export function useLeaderboardSync({ refreshIntervalMs = 60000 }: UseLeaderboardSyncOptions = {}) {
  const [data, setData] = useState<DisplayResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [errorCount, setErrorCount] = useState(0);

  const isFetchingRef = useRef(false);
  const refreshTimerRef = useRef<any>(null);

  const loadData = useCallback(async (isInitial = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const response = await fetchCurrentDisplay();
      setData(response);
      setIsConnected(true);
      setErrorCount(0);
      setLastSyncedAt(new Date());
    } catch (err) {
      console.warn('Leaderboard sync error (retaining cached data in memory):', err);
      setIsConnected(false);
      setErrorCount((prev) => prev + 1);
      // Notice: We intentionally do NOT clear `data`! In-memory retention keeps TV running smoothly.
    } finally {
      isFetchingRef.current = false;
      if (isInitial) {
        setIsLoading(false);
      }
    }
  }, []);

  // 1. Initial fetch & 60-second periodic sync
  useEffect(() => {
    loadData(true);

    const interval = data?.settings?.dataRefreshIntervalSeconds
      ? data.settings.dataRefreshIntervalSeconds * 1000
      : refreshIntervalMs;

    refreshTimerRef.current = setInterval(() => {
      loadData(false);
    }, interval);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [loadData, refreshIntervalMs, data?.settings?.dataRefreshIntervalSeconds]);

  // 2. Refresh immediately when window/tab regains focus or reconnects
  useEffect(() => {
    const handleFocus = () => {
      loadData(false);
    };

    const handleOnline = () => {
      setIsConnected(true);
      loadData(false);
    };

    const handleOffline = () => {
      setIsConnected(false);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadData]);

  return {
    data,
    isLoading,
    isConnected,
    lastSyncedAt,
    errorCount,
    refetch: () => loadData(false),
  };
}
