import React from 'react';
import { Crown, Trophy, Users, Sparkles, AlertCircle, ShieldAlert, Calendar, Star, Award, ChevronRight } from 'lucide-react';
import { TopTeamLeaderRecognition, WinningTeamLeaderItem } from '../../types/index.js';
import { AvatarWithFallback } from '../common/AvatarWithFallback.js';

interface TeamLeaderSpotlightCardProps {
  recognition: TopTeamLeaderRecognition;
  intervalMs?: number;
}

export const TeamLeaderSpotlightCard: React.FC<TeamLeaderSpotlightCardProps> = ({
  recognition,
  intervalMs = 5000,
}) => {
  const {
    isTie,
    maxEmployeeCount,
    winningTeams = [],
    weekStartDate,
    weekEndDate,
    weekTitle,
  } = recognition;

  // Format date range (e.g., Oct 12, 2026 – Oct 18, 2026)
  const formatDateRange = () => {
    if (!weekStartDate || !weekEndDate) return 'CURRENT PERFORMANCE CYCLE';
    try {
      const start = new Date(weekStartDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const end = new Date(weekEndDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      return `${start} – ${end}`.toUpperCase();
    } catch {
      return 'CURRENT PERFORMANCE CYCLE';
    }
  };

  // -------------------------------------------------------------
  // RENDER CASE 1: MULTI-TEAM TIE SHOWCASE ("TOP PERFORMING TEAMS")
  // -------------------------------------------------------------
  if (isTie && winningTeams.length > 1) {
    return (
      <div className="relative w-full max-w-6xl xl:max-w-7xl mx-auto px-4 select-none">
        <div className="relative rounded-3xl p-6 sm:p-8 lg:p-10 transition-all duration-700 overflow-hidden glass-panel-gold border-2 border-amber-400/80 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col justify-between">
          {/* Top Progress countdown bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-900/60 overflow-hidden">
            <div
              key="tie-progress"
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500"
              style={{
                animation: `progressCountdown ${intervalMs}ms linear forwards`,
              }}
            />
          </div>

          {/* Golden Ambiance Glows */}
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header Title Section */}
          <div className="relative z-10 text-center space-y-2 mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 border border-amber-400/50 shadow-inner">
              <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-amber-300 font-display">
                JOINT LEADERSHIP CHAMPIONS
              </span>
              <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display drop-shadow-lg uppercase">
              TOP PERFORMING TEAMS OF THE WEEK
            </h1>

            <div className="flex items-center justify-center gap-3 text-xs sm:text-sm text-slate-300 font-medium">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Calendar className="w-4 h-4" />
                <span className="font-mono">{formatDateRange()}</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="px-3 py-0.5 rounded-full bg-navy-900/90 border border-amber-500/40 text-amber-300 font-bold">
                Tied with {maxEmployeeCount} Top 10 Employees Each
              </span>
            </div>
          </div>

          {/* Tied Teams Grid */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch justify-center">
            {winningTeams.map((team, idx) => {
              const hasLeader = Boolean(team.teamLeader);
              return (
                <div
                  key={team.teamId || idx}
                  className="rounded-2xl p-6 bg-navy-950/80 border border-amber-400/40 shadow-xl flex flex-col justify-between text-center relative overflow-hidden group hover:border-amber-400/80 transition-all"
                >
                  {/* Subtle team slot badge */}
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-400">
                    {team.teamId}
                  </div>

                  {/* Team representation badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-amber-400 text-navy-950 font-black text-[11px] shadow">
                    {team.employeeCount} in Top 10
                  </div>

                  <div className="mt-6 flex flex-col items-center">
                    {/* Leader Portrait */}
                    <div className="relative mb-4">
                      {hasLeader ? (
                        <div className="p-1 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 shadow-lg shadow-amber-500/20">
                          <AvatarWithFallback
                            src={team.teamLeader?.imageUrl || ''}
                            alt={team.teamLeader?.fullName || team.teamName}
                            rank={1}
                            className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-navy-900 border-2 border-dashed border-amber-500/40 flex flex-col items-center justify-center text-amber-400 p-2 text-center">
                          <Users className="w-8 h-8 mb-1 opacity-60" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            Leader Pending
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Team Name */}
                    <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
                      Team
                    </span>
                    <h3 className="text-2xl font-black text-white font-display uppercase tracking-tight">
                      {team.teamName}
                    </h3>

                    {/* Leader Name & Designation */}
                    {hasLeader ? (
                      <div className="mt-2 space-y-0.5">
                        <p className="text-lg font-bold text-slate-100">
                          {team.teamLeader?.fullName}
                        </p>
                        <p className="text-xs font-semibold text-slate-300">
                          {team.teamLeader?.designation}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-amber-200/80 italic bg-amber-950/60 px-3 py-1.5 rounded-lg border border-amber-800/60">
                        Designated team leader configuration pending in HR Admin Panel.
                      </p>
                    )}
                  </div>

                  {/* Bottom Accolade */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Joint Weekly Champion</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER CASE 2: SINGLE WINNING TEAM SHOWCASE
  // -------------------------------------------------------------
  const winner = winningTeams[0];
  const hasLeader = Boolean(winner?.teamLeader);
  const leader = winner?.teamLeader;

  return (
    <div className="relative w-full max-w-6xl xl:max-w-7xl mx-auto px-4 select-none">
      <div className="relative rounded-3xl p-6 sm:p-8 lg:p-12 transition-all duration-700 overflow-hidden glass-panel-gold border-2 border-amber-400/80 shadow-[0_0_60px_rgba(245,158,11,0.25)] flex flex-col gap-6 lg:gap-8">
        {/* Top Countdown Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-900/60 overflow-hidden">
          <div
            key={winner?.teamId || 'single-leader-progress'}
            className="h-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500"
            style={{
              animation: `progressCountdown ${intervalMs}ms linear forwards`,
            }}
          />
        </div>

        {/* Ambient Luxurious Glow Effects */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-400/25 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-yellow-400/20 rounded-full blur-[140px] pointer-events-none" />

        {/* 1. Header Recognition Banner */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-navy-950 rounded-[14px] flex items-center justify-center">
                <Crown className="w-7 h-7 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <div>
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-amber-400 font-display block">
                EXCELLENCE IN LEADERSHIP
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight font-display uppercase">
                TOP PERFORMING TEAM LEADER OF THE WEEK
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-900/90 border border-amber-500/40 text-xs sm:text-sm font-semibold text-slate-200 shadow-sm">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-amber-300 font-bold">{formatDateRange()}</span>
          </div>
        </div>

        {/* 2. Main Hero Showcase Content */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-stretch gap-8 lg:gap-12">
          {/* LEFT: Team Leader Portrait with Luxury Golden Ring */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="relative">
              {/* Outer Golden Crown Badge */}
              <div className="absolute -top-4 -right-3 z-20 flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-navy-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/40 border border-white">
                <Star className="w-3.5 h-3.5 fill-navy-950 stroke-navy-950" />
                <span>CHAMPION LEADER</span>
              </div>

              {hasLeader ? (
                <div className="p-2 sm:p-2.5 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 shadow-2xl shadow-amber-500/30">
                  <AvatarWithFallback
                    src={leader?.imageUrl || ''}
                    alt={leader?.fullName || winner?.teamName || 'Team Leader'}
                    rank={1}
                    fitMode="smart-portrait"
                    className="w-64 sm:w-72 md:w-80 lg:w-[350px] xl:w-[390px] aspect-[4/5] rounded-2xl sm:rounded-[22px]"
                  />
                </div>
              ) : (
                <div className="w-64 sm:w-72 md:w-80 lg:w-[350px] xl:w-[390px] aspect-[4/5] rounded-3xl bg-navy-900/90 border-2 border-dashed border-amber-400/60 flex flex-col items-center justify-center p-6 text-center shadow-xl">
                  <Users className="w-16 h-16 text-amber-400/70 mb-3" />
                  <p className="text-base font-bold text-white uppercase font-display">
                    Leader Not Configured
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    HR action required: Assign designated leader for {winner?.teamName} in Team Management.
                  </p>
                </div>
              )}

              {/* Bottom Team Tag Overlay */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-navy-950/95 border-2 border-amber-400/80 text-amber-300 font-extrabold text-xs sm:text-sm uppercase tracking-widest shadow-xl whitespace-nowrap">
                TEAM {winner?.teamName?.toUpperCase()}
              </div>
            </div>
          </div>

          {/* RIGHT: Recognition Accolades, Name, Designation & Top 10 Count */}
          <div className="flex-1 flex flex-col justify-between text-center lg:text-left py-2 space-y-6">
            <div className="space-y-3">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3">
                <span className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/60 text-amber-300 text-xs sm:text-sm font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>WINNING TEAM: {winner?.teamName}</span>
                </span>

                {leader?.employeeId && (
                  <span className="px-3 py-1.5 rounded-full bg-navy-900/90 border border-slate-700/80 text-amber-300/90 text-xs sm:text-sm font-mono font-bold tracking-wider shadow-sm">
                    {leader.employeeId}
                  </span>
                )}
              </div>

              {/* Full Name */}
              {hasLeader ? (
                <h2 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tight font-display drop-shadow-md leading-tight">
                  {leader?.fullName}
                </h2>
              ) : (
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-200 tracking-tight font-display uppercase">
                  TEAM {winner?.teamName}
                </h2>
              )}

              {/* Designation */}
              {hasLeader ? (
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-300/90 tracking-wide">
                  {leader?.designation}
                </p>
              ) : (
                <div className="flex items-center justify-center lg:justify-start gap-2 text-rose-300 text-sm bg-rose-950/60 border border-rose-700/60 p-3 rounded-xl max-w-lg">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>
                    No team leader currently assigned. Please configure a team leader in the HR Admin Panel.
                  </span>
                </div>
              )}
            </div>

            {/* Impact Metric & Corporate Leadership Thought Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
              {/* Metric 1: Count of performers */}
              <div className="p-4 sm:p-5 rounded-2xl bg-navy-900/90 border border-amber-400/40 shadow-lg flex items-center gap-4 text-left">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shrink-0 shadow-md">
                  <Users className="w-7 h-7 text-navy-950 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-white font-display">
                      {winner?.employeeCount || maxEmployeeCount}
                    </span>
                    <span className="text-xs uppercase font-extrabold text-amber-400">
                      Employees
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    in this week's Top 10 leaderboard
                  </p>
                </div>
              </div>

              {/* Metric 2: Leadership Impact */}
              <div className="p-4 sm:p-5 rounded-2xl bg-navy-900/90 border border-slate-700/80 shadow-lg flex items-center gap-4 text-left">
                <div className="w-14 h-14 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                  <Award className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-widest font-black text-blue-400 block font-display">
                    LEADERSHIP IMPACT
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 font-semibold mt-0.5">
                    Highest representation among all corporate teams
                  </p>
                </div>
              </div>
            </div>

            {/* Recognition Message Accolade Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-transparent border-l-4 border-amber-400 text-left">
              <p className="text-xs sm:text-sm text-slate-200 font-medium italic leading-relaxed">
                "Honored for exceptional mentorship, vision, and empowering team members to achieve the highest collective representation in this week's corporate Top 10."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
