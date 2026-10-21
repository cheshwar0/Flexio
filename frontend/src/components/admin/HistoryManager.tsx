import React, { useState, useEffect } from 'react';
import { History, Calendar, Eye, Trophy, Award } from 'lucide-react';
import { fetchWeeks, fetchWeekById } from '../../services/weekService.js';
import { Week, WeeklyRankingItem } from '../../types/index.js';
import { LeaderboardPreviewModal } from './LeaderboardPreviewModal.js';
import { AvatarWithFallback } from '../common/AvatarWithFallback.js';

export const HistoryManager: React.FC = () => {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [rankings, setRankings] = useState<WeeklyRankingItem[]>([]);
  const [previewWeek, setPreviewWeek] = useState<{ week: Week; rankings: WeeklyRankingItem[] } | null>(null);

  useEffect(() => {
    fetchWeeks()
      .then((data) => {
        const publishedOnly = data.filter((w) => w.status === 'published');
        setWeeks(publishedOnly);
        if (publishedOnly.length > 0) {
          handleSelectWeek(publishedOnly[0]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelectWeek = async (week: Week) => {
    setSelectedWeek(week);
    try {
      const data = await fetchWeekById(week._id);
      setRankings(data.rankings || []);
    } catch (err) {
      console.error('Error fetching historical week rankings:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-display">
          Historical Weekly Rankings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Archived performance scorecards and historical Top 10 corporate recognition records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Published Weeks */}
        <div className="rounded-2xl glass-panel border border-slate-800 p-6 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
            Published Archive ({weeks.length})
          </h2>

          {loading ? (
            <p className="text-xs text-slate-500 py-4">Loading historical records...</p>
          ) : weeks.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No published weeks recorded yet.</p>
          ) : (
            weeks.map((w) => {
              const isSelected = selectedWeek?._id === w._id;
              return (
                <button
                  key={w._id}
                  onClick={() => handleSelectWeek(w)}
                  className={`w-full p-4 rounded-xl text-left border transition ${
                    isSelected
                      ? 'border-amber-400/80 bg-navy-850 shadow-md shadow-amber-500/10'
                      : 'border-slate-800 bg-navy-900/40 hover:bg-navy-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-amber-300">{w.weekId}</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                      Published
                    </span>
                  </div>
                  <p className="font-bold text-white text-sm truncate">{w.title}</p>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>
                      {new Date(w.weekStartDate).toLocaleDateString()} –{' '}
                      {new Date(w.weekEndDate).toLocaleDateString()}
                    </span>
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Right Column: Historical Ranking Details */}
        <div className="lg:col-span-2 rounded-2xl glass-panel border border-slate-800 p-6 space-y-4">
          {selectedWeek ? (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="font-mono text-xs font-bold text-amber-400">{selectedWeek.weekId}</span>
                  <h3 className="text-xl font-bold text-white font-display">{selectedWeek.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Published on:{' '}
                    {selectedWeek.publishedAt
                      ? new Date(selectedWeek.publishedAt).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>

                <button
                  onClick={() => setPreviewWeek({ week: selectedWeek, rankings })}
                  className="px-4 py-2 rounded-xl bg-navy-850 hover:bg-navy-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Preview Full Display</span>
                </button>
              </div>

              {/* Performers Table */}
              <div className="divide-y divide-slate-800/80">
                {rankings.map((r) => (
                  <div key={r.employeeId} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          r.rank === 1
                            ? 'bg-amber-400 text-navy-950 font-black'
                            : r.rank === 2
                            ? 'bg-slate-300 text-navy-950'
                            : r.rank === 3
                            ? 'bg-amber-600 text-white'
                            : 'bg-navy-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        #{r.rank}
                      </div>
                      <AvatarWithFallback
                        src={r.imageUrl}
                        alt={r.fullName || r.employeeId}
                        className="w-10 h-10 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-white text-sm">{r.fullName}</p>
                        <p className="text-xs text-slate-400">
                          {r.designation} • {r.department}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-amber-400 font-display">
                        {r.performanceScore}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold ml-1">PTS</span>
                      {r.achievementDescription && (
                        <p className="text-xs text-slate-400 italic line-clamp-1 max-w-xs">
                          "{r.achievementDescription}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500">
              Select a published performance week to view historical records.
            </div>
          )}
        </div>
      </div>

      {/* Full Preview Modal */}
      {previewWeek && (
        <LeaderboardPreviewModal
          week={previewWeek.week}
          rankings={previewWeek.rankings}
          onClose={() => setPreviewWeek(null)}
        />
      )}
    </div>
  );
};
