import React from 'react';
import { X, Sparkles, Send } from 'lucide-react';
import { Week, WeeklyRankingItem } from '../../types/index.js';
import { PerformerCard } from '../common/PerformerCard.js';

interface LeaderboardPreviewModalProps {
  week: Week;
  rankings: WeeklyRankingItem[];
  onClose: () => void;
  onPublish?: () => void;
}

export const LeaderboardPreviewModal: React.FC<LeaderboardPreviewModalProps> = ({
  week,
  rankings,
  onClose,
  onPublish,
}) => {
  const sortedRankings = [...rankings].sort((a, b) => a.rank - b.rank);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col p-4 md:p-8 overflow-y-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
              TV Display Simulation
            </span>
            <h2 className="text-xl font-bold text-white font-display">
              {week.title} ({week.weekId})
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onPublish && week.status === 'draft' && (
            <button
              onClick={onPublish}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-navy-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish to Office TV</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Simulated 16:9 TV Canvas */}
      <div className="flex-1 flex flex-col justify-center my-6 max-w-[1700px] mx-auto w-full">
        <div className="relative rounded-3xl p-8 glass-panel border border-slate-700/80 shadow-2xl overflow-hidden bg-navy-950">
          {/* Subtle TV Banner with Logo & Presenter */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="flex items-center gap-3 mb-2">
              <img
                src="/flexio-logo.png"
                alt="FLEXIO"
                className="h-9 max-w-[180px] object-contain drop-shadow"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="border-l border-slate-700/80 pl-3.5 text-left">
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-amber-400/90 block font-display">
                  REDGEINE TECHNOLOGY
                </span>
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold gold-gradient-text uppercase font-display mt-2">
              WEEKLY TOP 10 PERFORMERS
            </h1>
          </div>

          {/* Cards Grid Preview */}
          {sortedRankings.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              No performers added to this weekly leaderboard yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedRankings.map((r, idx) => (
                <div key={r.employeeId || idx} className="h-full flex justify-center">
                  <PerformerCard
                    performer={{
                      rank: r.rank,
                      employeeId: r.employeeId,
                      fullName: r.fullName || 'Employee Name',
                      team: r.team || 'Corporate',
                      designation: r.designation || 'Designation',
                      department: r.department || 'Department',
                      imageUrl: r.imageUrl || '',
                      performanceScore: r.performanceScore,
                      achievementDescription: r.achievementDescription,
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
