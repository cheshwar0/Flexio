import React from 'react';
import { Trophy, Calendar, Award, ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';

interface HeaderProps {
  companyName?: string;
  companyLogoUrl?: string;
  companySubtitle?: string;
  presentedBy?: string;
  weekTitle?: string;
  weekStartDate?: string;
  weekEndDate?: string;
  isConnected?: boolean;
  lastSyncedAt?: Date | null;
  onBack?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  companyName = 'FLEXIO',
  companyLogoUrl = '/flexio-logo.png',
  companySubtitle = 'REDGENIE TECHNOLOGIES PVT.LTD',
  presentedBy = 'Alpha Team',
  weekTitle = 'WEEKLY LEADERBOARD',
  weekStartDate,
  weekEndDate,
  isConnected = true,
  lastSyncedAt,
  onBack,
  onToggleFullscreen,
  isFullscreen = false,
}) => {
  // Format dates e.g. Oct 12 – Oct 18, 2026
  const formatDateRange = () => {
    if (!weekStartDate || !weekEndDate) return '';
    try {
      const start = new Date(weekStartDate);
      const end = new Date(weekEndDate);
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      const startStr = start.toLocaleDateString('en-US', options);
      const endStr = end.toLocaleDateString('en-US', { ...options, year: 'numeric' });
      return `${startStr} – ${endStr}`;
    } catch {
      return '';
    }
  };

  const dateRange = formatDateRange();

  return (
    <header className="relative w-full z-20 px-8 py-5 border-b border-slate-800/80 bg-navy-950/80 backdrop-blur-xl">
      {/* Subtle top gold accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />

      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Corporate Logo & Company Identity */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img
              src={companyLogoUrl || '/flexio-logo.png'}
              alt={companyName || 'FLEXIO'}
              className="h-10 sm:h-12 max-w-[220px] object-contain drop-shadow"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="hidden sm:block border-l border-slate-700/80 pl-3.5">
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-amber-400/90 block font-display">
                {companySubtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Main Leaderboard Heading */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold tracking-widest uppercase text-amber-300">
              {weekTitle}
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight gold-gradient-text uppercase font-display drop-shadow-sm">
            WEEKLY TOP 10 PERFORMERS
          </h1>
        </div>

        {/* Right: Date Range Badge, Live Update Indicator & Fullscreen */}
        <div className="flex items-center gap-3 sm:gap-4">
          {dateRange && (
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-navy-850/90 border border-slate-700/60 shadow-inner">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="text-xs md:text-sm font-medium text-slate-200 tracking-wide">
                {dateRange}
              </span>
            </div>
          )}

          {/* Live Sync Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-900 border border-slate-800 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              {isConnected ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </>
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </>
              )}
            </span>
            <span
              className={`text-[11px] font-semibold tracking-wider uppercase ${
                isConnected ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {isConnected ? 'LIVE SYNC' : 'OFFLINE'}
            </span>
            {lastSyncedAt && (
              <span className="text-[10px] text-slate-500 hidden lg:inline">
                • {lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          {/* Fullscreen Toggle Button */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter TV Fullscreen (F11)'}
              className="p-2 rounded-xl bg-navy-900 hover:bg-navy-850 border border-slate-700/80 text-slate-300 hover:text-amber-400 transition-colors shadow-sm cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
