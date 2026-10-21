import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Users,
  Search,
  Filter,
  Check,
  Plus,
  Trash2,
  Eye,
  Send,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpDown,
  X,
} from 'lucide-react';
import { fetchEmployees } from '../../services/employeeService.js';
import { fetchTeams } from '../../services/teamService.js';
import { publishNewWeeklyTop10, fetchWeeks } from '../../services/weekService.js';
import { Employee, Team, WeeklyRankingItem, Week } from '../../types/index.js';
import { AvatarWithFallback } from '../common/AvatarWithFallback.js';
import { LeaderboardPreviewModal } from './LeaderboardPreviewModal.js';

export const SelectWeeklyTop10: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeWeek, setActiveWeek] = useState<Week | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('All Teams');

  // Week formulation inputs
  const [weekId, setWeekId] = useState('');
  const [title, setTitle] = useState('');
  const [presentedBy, setPresentedBy] = useState('Alpha Team');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPerformers, setSelectedPerformers] = useState<WeeklyRankingItem[]>([]);
  const [allowTies, setAllowTies] = useState(false);

  // Modals & Feedback
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showConfirmPublish, setShowConfirmPublish] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize dates and default week ID on mount
  useEffect(() => {
    const today = new Date();
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);

    const weekNum = Math.ceil(
      (today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / (7 * 24 * 3600 * 1000)
    );
    const calculatedWeekId = `${today.getFullYear()}-W${weekNum}`;

    setWeekId(calculatedWeekId);
    setTitle(`Week ${weekNum} Corporate Championship`);
    setStartDate(lastMonday.toISOString().split('T')[0]);
    setEndDate(lastSunday.toISOString().split('T')[0]);

    // Fetch data
    Promise.all([fetchEmployees({ activeOnly: true }), fetchTeams(), fetchWeeks()])
      .then(([empData, teamData, weekData]) => {
        setEmployees(empData);
        setTeams(teamData);
        const currentPublished = weekData.find((w) => w.isCurrent && w.status === 'published');
        if (currentPublished) {
          setActiveWeek(currentPublished);
          if (currentPublished.presentedBy) {
            setPresentedBy(currentPublished.presentedBy);
          }
        }
      })
      .catch((err) => setMessage({ type: 'error', text: 'Error loading data from database.' }))
      .finally(() => setLoading(false));
  }, []);

  // Filtered employees from permanent directory
  const filteredEmployees = employees.filter((emp) => {
    const matchesTeam = selectedTeam === 'All Teams' || emp.team === selectedTeam;
    const matchesSearch =
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation.toLowerCase().includes(search.toLowerCase());
    return matchesTeam && matchesSearch;
  });

  const isSelected = (empId: string) => selectedPerformers.some((p) => p.employeeId === empId);

  // Toggle selection of an employee from the directory
  const handleToggleSelect = (emp: Employee) => {
    if (isSelected(emp.employeeId)) {
      // Deselect
      const updated = selectedPerformers
        .filter((p) => p.employeeId !== emp.employeeId)
        .map((p, idx) => ({ ...p, rank: idx + 1 }));
      setSelectedPerformers(updated);
    } else {
      // Select (up to 10 max)
      if (selectedPerformers.length >= 10) {
        setMessage({
          type: 'error',
          text: 'The Weekly Top 10 is full (10/10 selected). Deselect an employee to add another.',
        });
        return;
      }

      const nextRank = selectedPerformers.length + 1;
      const newPerformer: WeeklyRankingItem = {
        employeeId: emp.employeeId,
        fullName: emp.fullName,
        team: emp.team,
        designation: emp.designation,
        department: emp.department || emp.team,
        imageUrl: emp.imageUrl, // Automatically retrieved from permanent Cloudinary record!
        rank: nextRank,
        performanceScore: 900,
        achievementDescription: '',
      };

      setSelectedPerformers([...selectedPerformers, newPerformer]);
    }
  };

  // Auto-Rank employees descending by performance score
  const handleAutoRank = () => {
    const sorted = [...selectedPerformers].sort((a, b) => b.performanceScore - a.performanceScore);
    const reRanked = sorted.map((p, idx) => ({ ...p, rank: idx + 1 }));
    setSelectedPerformers(reRanked);
    setMessage({ type: 'success', text: 'Performers re-ordered by performance score (highest score = Rank 1).' });
  };

  // Edit rank manually
  const handleRankChange = (empId: string, newRank: number) => {
    setSelectedPerformers(
      selectedPerformers.map((p) => (p.employeeId === empId ? { ...p, rank: Math.max(1, Math.min(10, newRank)) } : p))
    );
  };

  // Edit score
  const handleScoreChange = (empId: string, newScore: number) => {
    setSelectedPerformers(
      selectedPerformers.map((p) =>
        p.employeeId === empId ? { ...p, performanceScore: Math.max(0, Math.min(1000, newScore)) } : p
      )
    );
  };

  // Edit achievement description
  const handleAchievementChange = (empId: string, text: string) => {
    setSelectedPerformers(
      selectedPerformers.map((p) => (p.employeeId === empId ? { ...p, achievementDescription: text } : p))
    );
  };

  // Execute publication: Atomically replaces current leaderboard on company TV
  const handleExecutePublish = async () => {
    if (selectedPerformers.length === 0) {
      alert('Please select at least 1 employee for the leaderboard.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await publishNewWeeklyTop10({
        weekId,
        title,
        presentedBy,
        weekStartDate: startDate,
        weekEndDate: endDate,
        rankings: selectedPerformers.map((p) => ({
          employeeId: p.employeeId,
          rank: p.rank,
          performanceScore: p.performanceScore,
          achievementDescription: p.achievementDescription,
        })),
        allowTies,
      });

      setShowConfirmPublish(false);
      setActiveWeek(res.week);
      setMessage({
        type: 'success',
        text: `Top 10 for ${res.week.weekId} published! The office TV display has been updated to showcase this new leaderboard.`,
      });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to publish leaderboard.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Weekly Top 10 Selection Workflow
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-display">
            Select & Publish Weekly Top 10
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Pick up to 10 performers from the permanent directory across all 8 company teams. Their photos and profile details are pulled automatically from Cloudinary.
          </p>
        </div>

        {/* Selected Count Badge & TV Broadcast Indicator */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="px-5 py-3 rounded-2xl bg-navy-900 border border-slate-700/80 shadow-inner flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm font-display ${
                selectedPerformers.length === 10
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {selectedPerformers.length}/10
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Leaderboard Capacity
              </span>
              <span className="text-xs font-bold text-white">
                {selectedPerformers.length === 10
                  ? 'Ready to Publish'
                  : `${10 - selectedPerformers.length} Slots Remaining`}
              </span>
            </div>
          </div>

          {activeWeek && (
            <div className="px-4 py-2.5 rounded-2xl bg-navy-900/60 border border-slate-800 text-xs hidden sm:block">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Currently on TV</span>
              <span className="text-amber-300 font-bold font-mono">{activeWeek.weekId}</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-start justify-between gap-3 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-200'
              : 'bg-rose-950/80 border border-rose-700/60 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Week Metadata Settings */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Performance Week ID
          </label>
          <input
            type="text"
            required
            value={weekId}
            onChange={(e) => setWeekId(e.target.value.toUpperCase())}
            placeholder="e.g. 2026-W43"
            className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-slate-700 text-white font-mono text-sm focus:border-amber-400 font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Display Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q4 Sprint Championship"
            className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-slate-700 text-white text-sm focus:border-amber-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Presented By (Host Team)
          </label>
          <select
            value={presentedBy}
            onChange={(e) => setPresentedBy(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-slate-700 text-amber-300 font-bold text-sm focus:border-amber-400"
          >
            {[
              'Alpha Team',
              'Beta Team',
              'Gamma Team',
              'Delta Team',
              'Omega Team',
              'Sigma Team',
              'Appex Team',
              'Zta Team',
            ].map((teamName) => (
              <option key={teamName} value={teamName}>
                {teamName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Start Date
          </label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-slate-700 text-white text-sm focus:border-amber-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            End Date
          </label>
          <input
            type="date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-slate-700 text-white text-sm focus:border-amber-400"
          />
        </div>
      </div>

      {/* Main Dual-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Permanent Employee Directory Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Permanent Employee Directory</span>
              </h2>
              <span className="text-xs text-slate-400">{filteredEmployees.length} Available</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, ID, or title..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:border-amber-400"
              />
            </div>

            {/* Filter by 8 Teams */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                Filter by Team:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedTeam('All Teams')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    selectedTeam === 'All Teams'
                      ? 'bg-amber-400 text-navy-950 font-bold'
                      : 'bg-navy-900 text-slate-400 hover:text-white'
                  }`}
                >
                  All Teams
                </button>
                {teams.map((t) => (
                  <button
                    key={t.slotNumber}
                    type="button"
                    onClick={() => setSelectedTeam(t.name)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      selectedTeam === t.name
                        ? 'bg-amber-400 text-navy-950 font-bold'
                        : 'bg-navy-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Employee Selection List */}
            <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
              {filteredEmployees.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No employees found matching filter.
                </div>
              ) : (
                filteredEmployees.map((emp) => {
                  const selected = isSelected(emp.employeeId);
                  return (
                    <div
                      key={emp.employeeId}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                        selected
                          ? 'border-amber-400/80 bg-amber-500/10 shadow-sm'
                          : 'border-slate-800 bg-navy-900/60 hover:bg-navy-850'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <AvatarWithFallback
                          src={emp.imageUrl}
                          alt={emp.fullName}
                          className="w-10 h-10 shrink-0"
                        />
                        <div className="truncate">
                          <p className="text-xs font-bold text-white truncate">{emp.fullName}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {emp.team} • {emp.designation}
                          </p>
                          <span className="text-[10px] font-mono text-amber-300 font-bold">
                            {emp.employeeId}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleSelect(emp)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 flex items-center gap-1 ${
                          selected
                            ? 'bg-amber-400 text-navy-950 hover:bg-amber-300'
                            : 'bg-navy-800 hover:bg-navy-700 text-slate-200 border border-slate-700'
                        }`}
                      >
                        {selected ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Selected</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Select</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Weekly Top 10 Scorecard & Rank Assignment Board (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl glass-panel border border-amber-500/30 space-y-5 shadow-2xl">
            {/* Top 10 Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-black text-white font-display flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>Selected Top 10 Performers ({selectedPerformers.length}/10)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Assign official ranks and scores for the active TV broadcast.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoRank}
                  disabled={selectedPerformers.length === 0}
                  className="px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 transition"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Auto-Rank by Score</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  disabled={selectedPerformers.length === 0}
                  className="px-3.5 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 transition"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Simulate TV</span>
                </button>
              </div>
            </div>

            {/* Performers Assigned List */}
            {selectedPerformers.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-2xl space-y-3">
                <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-400">No performers selected yet.</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click 'Select' next to any employee from the permanent directory on the left to include them in the weekly Top 10.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedPerformers.map((performer) => {
                  const isRank1 = performer.rank === 1;
                  const isRank2 = performer.rank === 2;
                  const isRank3 = performer.rank === 3;

                  return (
                    <div
                      key={performer.employeeId}
                      className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isRank1
                          ? 'border-amber-400/80 bg-amber-500/10 shadow-md shadow-amber-500/10'
                          : isRank2
                          ? 'border-slate-300/60 bg-slate-400/10'
                          : isRank3
                          ? 'border-amber-700/60 bg-amber-800/10'
                          : 'border-slate-800 bg-navy-900/80'
                      }`}
                    >
                      {/* Left: Rank & Photo & Details */}
                      <div className="flex items-center gap-3">
                        {/* Rank Badge */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow ${
                            isRank1
                              ? 'bg-amber-400 text-navy-950 font-black'
                              : isRank2
                              ? 'bg-slate-200 text-navy-950'
                              : isRank3
                              ? 'bg-amber-600 text-white'
                              : 'bg-navy-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          #{performer.rank}
                        </div>

                        {/* Saved Cloudinary Portrait Photo */}
                        <AvatarWithFallback
                          src={performer.imageUrl}
                          alt={performer.fullName || performer.employeeId}
                          rank={performer.rank}
                          className="w-12 h-12 rounded-xl shrink-0"
                        />

                        <div>
                          <p className="font-bold text-white text-sm">{performer.fullName}</p>
                          <p className="text-xs text-slate-300">
                            <span className="font-semibold text-amber-300">{performer.team}</span> •{' '}
                            {performer.designation}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400">
                            {performer.employeeId}
                          </span>
                        </div>
                      </div>

                      {/* Right: Thought Input & Remove Action */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto flex-1 justify-end">
                        <div className="flex-1 sm:max-w-md">
                          <label className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block mb-0.5">
                            Thought for this Image:
                          </label>
                          <input
                            type="text"
                            placeholder="Write a thought or recognition note for this image..."
                            value={performer.achievementDescription || ''}
                            onChange={(e) =>
                              handleAchievementChange(performer.employeeId, e.target.value)
                            }
                            className="w-full px-3 py-1.5 rounded-xl bg-navy-950 border border-slate-700 text-slate-100 text-xs focus:border-amber-400 placeholder-slate-500 shadow-inner"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleSelect({ employeeId: performer.employeeId } as any)}
                          className="p-2 text-slate-400 hover:text-rose-400 transition rounded-xl hover:bg-navy-950 self-end sm:self-center"
                          title="Remove from Top 10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Actions: Publish Button */}
            {selectedPerformers.length > 0 && (
              <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-400">
                  <span>Selected: </span>
                  <span className="font-bold text-amber-300">{selectedPerformers.length} of 10</span>
                  <span> • Ready for TV broadcast</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowConfirmPublish(true)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-navy-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 transition transform hover:-translate-y-0.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish New Weekly Top 10</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog: Replace Current Leaderboard */}
      {showConfirmPublish && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl p-6 md:p-8 glass-panel border border-amber-500/40 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-display">
                  Replace Current Weekly Leaderboard?
                </h3>
                <span className="text-xs text-amber-400 font-semibold">Immediate Office TV Update</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>
                Publishing this selection will <strong>immediately replace the currently displayed leaderboard on the company TV</strong> with these {selectedPerformers.length} performers for week <span className="font-mono text-amber-300 font-bold">{weekId}</span>, presented by <span className="text-amber-300 font-bold">{presentedBy}</span>.
              </p>
              <p className="text-slate-400">
                • The previous leaderboard will be safely preserved in the historical archives.<br />
                • The office TV will automatically update without a manual browser refresh.<br />
                • The permanent employee directory and Cloudinary photos remain completely unchanged.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmPublish(false)}
                className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleExecutePublish}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-navy-950 font-bold text-xs uppercase tracking-wider shadow flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Confirm & Replace TV Leaderboard</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Simulation Preview Modal */}
      {showPreviewModal && (
        <LeaderboardPreviewModal
          week={{
            _id: 'preview',
            weekId,
            title,
            weekStartDate: startDate,
            weekEndDate: endDate,
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }}
          rankings={selectedPerformers}
          onClose={() => setShowPreviewModal(false)}
          onPublish={() => {
            setShowPreviewModal(false);
            setShowConfirmPublish(true);
          }}
        />
      )}
    </div>
  );
};
