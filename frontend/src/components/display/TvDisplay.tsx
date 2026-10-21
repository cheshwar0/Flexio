import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Clock, AlertCircle } from 'lucide-react';
import { useLeaderboardSync } from '../../hooks/useLeaderboardSync.js';
import { Header } from '../common/Header.js';
import { Footer } from '../common/Footer.js';
import { PerformerSpotlightCard } from '../common/PerformerSpotlightCard.js';
import { TeamLeaderSpotlightCard } from './TeamLeaderSpotlightCard.js';

export const TvDisplay: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isConnected, lastSyncedAt } = useLeaderboardSync({
    refreshIntervalMs: 60000,
  });

  const initialSlideParam = new URLSearchParams(window.location.search).get('slide');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const performers = data?.leaderboard?.performers || [];
  const hasPublishedData = Boolean(data?.published && performers.length > 0);
  const topTeamLeader = data?.topTeamLeader;
  const hasTeamLeaderSlide = Boolean(
    hasPublishedData && topTeamLeader && topTeamLeader.winningTeams && topTeamLeader.winningTeams.length > 0
  );

  // Total slides = performers slides + 1 team leader recognition slide
  const totalSlides = performers.length + (hasTeamLeaderSlide ? 1 : 0);

  // Allow starting directly on the team leader slide if ?slide=leader is in URL
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current && hasTeamLeaderSlide && (initialSlideParam === 'leader' || initialSlideParam === 'team-leader')) {
      setCurrentSlideIndex(performers.length);
      initializedRef.current = true;
    }
  }, [hasTeamLeaderSlide, performers.length, initialSlideParam]);

  // Dynamic timing: Performer slide duration (default 5s) vs Team Leader slide duration (default 5s)
  const isTeamLeaderSlide = hasTeamLeaderSlide && currentSlideIndex === performers.length;
  const performerDurationMs = (data?.settings?.carouselIntervalSeconds || 5) * 1000;
  const teamLeaderDurationMs = (data?.settings?.teamLeaderSlideDurationSeconds || 5) * 1000;
  const activeSlideDurationMs = isTeamLeaderSlide ? teamLeaderDurationMs : performerDurationMs;

  // Reset index if out of bounds (e.g. after data updates)
  useEffect(() => {
    if (totalSlides > 0 && currentSlideIndex >= totalSlides) {
      setCurrentSlideIndex(0);
    }
  }, [totalSlides, currentSlideIndex]);


  // Autonomous slideshow runner following exact sequence:
  // 1. Weekly Top 10 employee leaderboard (0 to performers.length - 1)
  // 2. Top Team Leader recognition slide (index === performers.length)
  // 3. Repeat continuously
  useEffect(() => {
    if (!hasPublishedData || totalSlides <= 1) {
      return;
    }

    const timer = setTimeout(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
    }, activeSlideDurationMs);

    return () => clearTimeout(timer);
  }, [hasPublishedData, totalSlides, activeSlideDurationMs, currentSlideIndex]);

  // Current single active performer (when on performer slides)
  const activePerformer = performers[currentSlideIndex] || performers[0];


  // Fullscreen management
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Gracefully return to previous page or Admin Dashboard
  const handleGoBack = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    // If opened as a new tab via window.open, attempt to close
    if (window.opener && window.history.length <= 1) {
      try {
        window.close();
        return;
      } catch {
        // Fallback below
      }
    }
    const token = localStorage.getItem('flexio_admin_token');
    if (token) {
      navigate('/admin/dashboard');
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Allow Escape key to exit, and Left/Right arrows to navigate slides manually
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        handleGoBack();
      } else if (e.key === 'ArrowRight' && totalSlides > 1) {
        setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
      } else if (e.key === 'ArrowLeft' && totalSlides > 1) {
        setCurrentSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSlides]);


  return (
    <div
      className="relative w-screen h-screen min-h-screen bg-navy-950 text-slate-100 flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Background radial luxury lighting effects */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* 1. TV Display Header */}
      <Header
        companyName={data?.settings?.companyName}
        companyLogoUrl={data?.settings?.companyLogoUrl}
        presentedBy={data?.leaderboard?.presentedBy || data?.settings?.presentedBy || 'Alpha Team'}
        weekTitle={isTeamLeaderSlide ? 'TOP PERFORMING TEAM LEADER RECOGNITION' : data?.leaderboard?.title}
        weekStartDate={data?.leaderboard?.weekStartDate}
        weekEndDate={data?.leaderboard?.weekEndDate}
        isConnected={isConnected}
        lastSyncedAt={lastSyncedAt}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
      />

      {/* 2. Main Content Area */}
      <main className="relative flex-1 flex flex-col justify-center items-center px-4 sm:px-8 lg:px-12 py-2 overflow-hidden">
        {isLoading && !data ? (
          /* Initial loading state */
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center animate-spin">
              <Sparkles className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white font-display">
              Connecting to Corporate Leaderboard...
            </h2>
            <p className="text-sm text-slate-400">Loading published weekly rankings</p>
          </div>
        ) : !hasPublishedData ? (
          /* Empty or Unannounced State as strictly requested: "Weekly rankings will be announced soon." */
          <div className="max-w-2xl mx-auto p-12 rounded-3xl glass-panel border border-slate-700/60 text-center flex flex-col items-center justify-center shadow-2xl">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6">
              <Clock className="w-10 h-10 text-amber-400 animate-pulse" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-display uppercase mb-3">
              Weekly rankings will be announced soon.
            </h2>
            <p className="text-slate-300 text-base leading-relaxed max-w-lg mb-6">
              Our human resources and leadership team are finalizing this week's performance scores and achievements.
            </p>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-navy-900 border border-slate-700 text-xs font-medium text-slate-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>TV display is running and will automatically reflect live rankings once published</span>
            </div>
          </div>
        ) : isTeamLeaderSlide && topTeamLeader ? (
          /* Top Performing Team Leader Recognition Slide */
          <div className="w-full max-w-[1920px] mx-auto flex flex-col justify-center items-center my-auto py-1">
            <div
              key="team-leader-slide"
              className="w-full flex justify-center spotlight-card-enter"
            >
              <TeamLeaderSpotlightCard
                recognition={topTeamLeader}
                intervalMs={teamLeaderDurationMs}
              />
            </div>
          </div>
        ) : (
          /* Single Image Spotlight Showcase */
          <div className="w-full max-w-[1920px] mx-auto flex flex-col justify-center items-center my-auto py-1">
            {/* Animated Single Performer Spotlight Container */}
            <div
              key={activePerformer.employeeId + currentSlideIndex}
              className="w-full flex justify-center spotlight-card-enter"
            >
              <PerformerSpotlightCard
                performer={activePerformer}
                totalPerformers={performers.length}
                intervalMs={performerDurationMs}
              />
            </div>
          </div>
        )}

        {/* Temporary Offline Notification Bar (Discreet, non-intrusive) */}
        {!isConnected && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/90 border border-amber-600/70 text-amber-200 text-xs shadow-xl backdrop-blur-md">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Connection to server paused. Displaying cached leaderboard.</span>
          </div>
        )}
      </main>

      {/* 3. TV Display Footer with Exit Button in Right Below Corner */}
      <Footer
        motivationalMessage={data?.settings?.motivationalMessage}
        activeSlide={currentSlideIndex}
        totalSlides={totalSlides}
        onExit={handleGoBack}
        onSelectSlide={setCurrentSlideIndex}
      />
    </div>
  );
};


