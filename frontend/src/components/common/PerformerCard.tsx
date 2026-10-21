import React from 'react';
import { Crown, Medal, Award, TrendingUp, Quote } from 'lucide-react';
import { Performer } from '../../types/index.js';
import { AvatarWithFallback } from './AvatarWithFallback.js';

interface PerformerCardProps {
  performer: Performer;
  isFirstPlace?: boolean;
}

export const PerformerCard: React.FC<PerformerCardProps> = ({ performer, isFirstPlace }) => {
  const { rank, fullName, employeeId, designation, department, imageUrl, performanceScore, achievementDescription } =
    performer;

  // Visual rank hierarchy
  const isRank1 = rank === 1 || isFirstPlace;
  const isRank2 = rank === 2;
  const isRank3 = rank === 3;

  // Rank badge styling
  const renderRankBadge = () => {
    if (isRank1) {
      return (
        <div className="absolute -top-3.5 left-6 z-10 flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-navy-950 font-black text-sm tracking-wider uppercase shadow-lg shadow-amber-500/40 border border-amber-200">
          <Crown className="w-4 h-4 fill-navy-950 stroke-navy-950" />
          <span>RANK #1 • CHAMPION</span>
        </div>
      );
    }
    if (isRank2) {
      return (
        <div className="absolute -top-3.5 left-6 z-10 flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 text-navy-950 font-black text-xs tracking-wider uppercase shadow-md shadow-slate-300/30 border border-white">
          <Medal className="w-3.5 h-3.5 fill-navy-950" />
          <span>RANK #2</span>
        </div>
      );
    }
    if (isRank3) {
      return (
        <div className="absolute -top-3.5 left-6 z-10 flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 text-white font-black text-xs tracking-wider uppercase shadow-md shadow-amber-600/30 border border-amber-300/60">
          <Award className="w-3.5 h-3.5 fill-white" />
          <span>RANK #3</span>
        </div>
      );
    }
    return (
      <div className="absolute -top-3 left-6 z-10 flex items-center justify-center px-3 py-0.5 rounded-full bg-navy-800 border border-slate-700 text-slate-300 font-bold text-xs tracking-wider uppercase shadow">
        <span>RANK #{rank}</span>
      </div>
    );
  };

  // Card background styling
  let containerStyle = 'glass-panel hover:border-slate-600/60';
  if (isRank1) containerStyle = 'glass-panel-gold ring-1 ring-amber-400/50';
  else if (isRank2) containerStyle = 'glass-panel-silver ring-1 ring-slate-300/40';
  else if (isRank3) containerStyle = 'glass-panel-bronze ring-1 ring-amber-700/40';

  return (
    <div
      className={`relative rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between h-full min-w-[320px] max-w-[380px] w-full select-none ${containerStyle}`}
    >
      {/* Dynamic Rank Badge */}
      {renderRankBadge()}

      <div>
        {/* Top Section: Employee Photo & Score */}
        <div className="flex items-start justify-between gap-4 mt-2">
          {/* Portrait with rank-highlighted ring */}
          <div className="relative">
            <AvatarWithFallback
              src={imageUrl}
              alt={fullName}
              rank={rank}
              className={`${
                isRank1
                  ? 'w-28 h-28 md:w-32 md:h-32 shadow-xl shadow-amber-500/20'
                  : 'w-24 h-24 md:w-28 md:h-28 shadow-md'
              }`}
            />
            {/* Rank numeric badge overlay on photo corner */}
            <div
              className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-lg ${
                isRank1
                  ? 'bg-amber-400 text-navy-950 ring-2 ring-white'
                  : isRank2
                  ? 'bg-slate-200 text-navy-950 ring-2 ring-white'
                  : isRank3
                  ? 'bg-amber-600 text-white ring-2 ring-amber-200'
                  : 'bg-navy-800 text-slate-300 border border-slate-600'
              }`}
            >
              #{rank}
            </div>
          </div>

          {/* Performance Score Pillar */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-navy-900/90 border border-slate-700/70 shadow-inner">
              <TrendingUp className={`w-4 h-4 ${isRank1 ? 'text-amber-400' : 'text-emerald-400'}`} />
              <div className="flex items-baseline gap-1">
                <span className="text-xl md:text-2xl font-black tracking-tight text-white font-display">
                  {performanceScore}
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-400">PTS</span>
              </div>
            </div>

            {/* Team Pill */}
            <span className="mt-2 text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30">
              {performer.team || department}
            </span>

            {employeeId && (
              <span className="mt-1 text-[10px] font-mono font-medium text-slate-400 tracking-wider">
                {employeeId}
              </span>
            )}
          </div>
        </div>

        {/* Middle Section: Name & Designation */}
        <div className="mt-5">
          <h2
            className={`font-black tracking-tight line-clamp-1 font-display ${
              isRank1 ? 'text-2xl md:text-3xl text-white drop-shadow' : 'text-xl md:text-2xl text-slate-100'
            }`}
            title={fullName}
          >
            {fullName}
          </h2>
          <p className="text-sm font-medium text-slate-300 mt-1 line-clamp-1" title={designation}>
            {designation}
          </p>
        </div>
      </div>

      {/* Bottom Section: Optional Achievement Highlight Quote */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80">
        {achievementDescription ? (
          <div className="flex items-start gap-2">
            <Quote className="w-3.5 h-3.5 text-amber-400/80 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 italic line-clamp-2 leading-relaxed">
              {achievementDescription}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="tracking-wider uppercase text-[10px] font-semibold">Excellence in Action</span>
            <span className="text-amber-400 font-bold">Top 10 Tier</span>
          </div>
        )}
      </div>
    </div>
  );
};
