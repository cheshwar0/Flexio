import React from 'react';
import { Crown, Medal, Award, TrendingUp, Quote, Sparkles, Star } from 'lucide-react';
import { Performer } from '../../types/index.js';
import { AvatarWithFallback } from './AvatarWithFallback.js';

interface PerformerSpotlightCardProps {
  performer: Performer;
  totalPerformers: number;
  intervalMs?: number;
}

export const PerformerSpotlightCard: React.FC<PerformerSpotlightCardProps> = ({
  performer,
  totalPerformers,
  intervalMs = 5000,
}) => {
  const { rank, fullName, employeeId, designation, department, imageUrl, performanceScore, achievementDescription } =
    performer;

  const isRank1 = rank === 1;
  const isRank2 = rank === 2;
  const isRank3 = rank === 3;

  // Custom panel styling based on rank
  let panelTheme = 'glass-panel border-slate-700/80 shadow-2xl';
  let accentGradient = 'from-blue-500 to-indigo-600';
  let badgeText = `RANK #${rank} OF ${totalPerformers}`;

  if (isRank1) {
    panelTheme = 'glass-panel-gold border-amber-400/60 shadow-amber-500/20';
    accentGradient = 'from-amber-400 via-yellow-300 to-amber-500';
    badgeText = `RANK #1 • WEEKLY CHAMPION`;
  } else if (isRank2) {
    panelTheme = 'glass-panel-silver border-slate-300/50 shadow-slate-300/15';
    accentGradient = 'from-slate-200 via-slate-300 to-slate-400';
    badgeText = `RANK #2 • FIRST RUNNER UP`;
  } else if (isRank3) {
    panelTheme = 'glass-panel-bronze border-amber-700/50 shadow-amber-700/15';
    accentGradient = 'from-amber-600 via-orange-500 to-amber-700';
    badgeText = `RANK #3 • SECOND RUNNER UP`;
  }

  // Calculate score percentage (out of 1000)
  const scorePercent = Math.min(100, Math.max(10, Math.round((performanceScore / 1000) * 100)));

  return (
    <div className="relative w-full max-w-6xl xl:max-w-7xl mx-auto px-4">
      <div
        className={`relative rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 transition-all duration-700 flex flex-col lg:flex-row items-stretch gap-6 sm:gap-8 lg:gap-12 select-none overflow-hidden ${panelTheme}`}
      >
        {/* Sleek countdown progress bar flush at the top edge of the card */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800/50 overflow-hidden">
          <div
            key={performer.employeeId + rank}
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-400"
            style={{
              animation: `progressCountdown ${intervalMs}ms linear forwards`,
            }}
          />
        </div>

        {/* Ambient background glow for rank 1 */}
        {isRank1 && (
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        )}

        {/* LEFT COLUMN: Hero Portrait (Enlarged frame, zero-cropping adaptive) */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="relative">
            <AvatarWithFallback
              src={imageUrl}
              alt={fullName}
              rank={rank}
              fitMode="smart-portrait"
              className="w-72 sm:w-80 md:w-96 lg:w-[440px] xl:w-[500px] h-[360px] sm:h-[420px] md:h-[480px] lg:h-[530px] xl:h-[560px] rounded-3xl shadow-2xl transition-all duration-500"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Badges, Uppercase Name, Designation & Compact Team Slogan Box */}
        <div className="flex-1 flex flex-col justify-between py-2 text-center lg:text-left gap-4">
          {/* Top section: Team Badge (Enlarged & Wider), Name in UPPERCASE, Designation */}
          <div className="space-y-4">
            {/* Team badge (Enlarged with wider padding, NO employee ID) */}
            <div className="flex items-center justify-center lg:justify-start">
              <span className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-yellow-400/20 to-amber-500/25 border-2 border-amber-400/60 text-amber-300 text-sm sm:text-base md:text-lg font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 inline-flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span>TEAM: {performer.team || department}</span>
              </span>
            </div>

            {/* Employee Full Name in ALL CAPS & Increased Font Size */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white tracking-tight font-display uppercase drop-shadow-lg leading-tight">
              {fullName}
            </h2>

            {/* Designation */}
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-300 tracking-wide">
              {designation}
            </p>
          </div>

          {/* Bottom section: Compact Team Slogan Box (Decreased height, per-team slogan) */}
          <div className="rounded-2xl p-4 sm:p-5 bg-navy-900/90 border border-amber-500/30 shadow-lg text-left relative overflow-hidden">
            <div className="flex items-center gap-2 mb-1.5 text-amber-400">
              <Quote className="w-4 h-4 fill-amber-400/20 shrink-0" />
              <span className="text-[11px] sm:text-xs uppercase tracking-widest font-black text-amber-300">
                TEAM SLOGAN • {performer.team || department}
              </span>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-slate-100 italic font-medium leading-relaxed">
              "{performer.teamSlogan || achievementDescription || 'Driving excellence through dedication, teamwork, and innovation.'}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
