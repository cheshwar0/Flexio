import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Edit,
  Eye,
  Send,
  Trash2,
  AlertCircle,
  CheckCircle,
  X,
  Trophy,
  ArrowUpDown,
  UserCheck,
} from 'lucide-react';
import {
  fetchWeeks,
  fetchWeekById,
  createWeek,
  updateWeekRankings,
  publishWeek,
  deleteWeek,
} from '../../services/weekService.js';
import { fetchEmployees } from '../../services/employeeService.js';
import { Week, WeeklyRankingItem, Employee } from '../../types/index.js';
import { LeaderboardPreviewModal } from './LeaderboardPreviewModal.js';
import { AvatarWithFallback } from '../common/AvatarWithFallback.js';

export const WeekManager: React.FC = () => {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Week creation modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWeekId, setNewWeekId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newPresentedBy, setNewPresentedBy] = useState('Alpha Team');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');

  // Active Week Editor
  const [activeWeek, setActiveWeek] = useState<Week | null>(null);
  const [rankingItems, setRankingItems] = useState<WeeklyRankingItem[]>([]);
  const [rankingMode, setRankingMode] = useState<'auto' | 'manual'>('auto');
  const [allowTies, setAllowTies] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Preview & Confirm Modals
  const [previewWeek, setPreviewWeek] = useState<{ week: Week; rankings: WeeklyRankingItem[] } | null>(null);
  const [confirmPublishWeek, setConfirmPublishWeek] = useState<Week | null>(null);
  const [confirmDeleteWeek, setConfirmDeleteWeek] = useState<Week | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [weekList, empList] = await Promise.all([fetchWeeks(), fetchEmployees({ activeOnly: true })]);
      setWeeks(weekList);
      setEmployees(empList);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error loading weekly performance data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateWeek = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createWeek({
        weekId: newWeekId,
        title: newTitle,
        presentedBy: newPresentedBy,
        weekStartDate: newStartDate,
        weekEndDate: newEndDate,
      });
      setMessage({ type: 'success', text: `Week ${newWeekId} created in draft mode.` });
      setShowCreateModal(false);
      setNewWeekId('');
      setNewTitle('');
      setNewPresentedBy('Alpha Team');
      setNewStartDate('');
      setNewEndDate('');
      loadData();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to create week draft.',
      });
    }
  };

  const handleOpenEditor = async (week: Week) => {
    try {
      setLoading(true);
      const data = await fetchWeekById(week._id || week.weekId);
      setActiveWeek(data.week);
      setRankingItems(data.rankings || []);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error opening week editor.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployeeToRankings = (emp: Employee) => {
    if (rankingItems.some((r) => r.employeeId === emp.employeeId)) {
      setMessage({ type: 'error', text: `${emp.fullName} is already included in this leaderboard.` });
      return;
    }
    if (rankingItems.length >= 10) {
      setMessage({ type: 'error', text: 'Maximum limit reached: A leaderboard can feature at most 10 performers.' });
      return;
    }

    const nextRank = rankingItems.length + 1;
    const newItem: WeeklyRankingItem = {
      employeeId: emp.employeeId,
      fullName: emp.fullName,
      designation: emp.designation,
      department: emp.department,
      imageUrl: emp.imageUrl,
      rank: nextRank,
      performanceScore: 900,
      achievementDescription: '',
    };

    setRankingItems([...rankingItems, newItem]);
  };

  const handleRemovePerformer = (employeeId: string) => {
    setRankingItems(rankingItems.filter((r) => r.employeeId !== employeeId));
  };

  const handleScoreChange = (employeeId: string, score: number) => {
    setRankingItems(
      rankingItems.map((r) => (r.employeeId === employeeId ? { ...r, performanceScore: score } : r))
    );
  };

  const handleManualRankChange = (employeeId: string, rank: number) => {
    setRankingItems(
      rankingItems.map((r) => (r.employeeId === employeeId ? { ...r, rank } : r))
    );
  };

  const handleAchievementChange = (employeeId: string, desc: string) => {
    setRankingItems(
      rankingItems.map((r) => (r.employeeId === employeeId ? { ...r, achievementDescription: desc } : r))
    );
  };

  const handleSaveRankings = async () => {
    if (!activeWeek) return;
    setIsSaving(true);
    try {
      await updateWeekRankings(activeWeek._id, {
        mode: rankingMode,
        allowTies,
        rankings: rankingItems.map((r) => ({
          employeeId: r.employeeId,
          rank: r.rank,
          performanceScore: r.performanceScore,
          achievementDescription: r.achievementDescription,
        })),
      });

      setMessage({ type: 'success', text: 'Weekly leaderboard rankings saved successfully.' });
      const refreshed = await fetchWeekById(activeWeek._id);
      setActiveWeek(refreshed.week);
      setRankingItems(refreshed.rankings);
      loadData();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to save rankings.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!confirmPublishWeek) return;
    try {
      await publishWeek(confirmPublishWeek._id);
      setMessage({
        type: 'success',
        text: `Week ${confirmPublishWeek.weekId} rankings published! Office televisions will display the updated results.`,
      });
      setConfirmPublishWeek(null);
      loadData();
      if (activeWeek?._id === confirmPublishWeek._id) {
        const refreshed = await fetchWeekById(confirmPublishWeek._id);
        setActiveWeek(refreshed.week);
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to publish week.',
      });
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteWeek) return;
    try {
      await deleteWeek(confirmDeleteWeek._id);
      setMessage({ type: 'success', text: `Week ${confirmDeleteWeek.weekId} deleted.` });
      setConfirmDeleteWeek(null);
      if (activeWeek?._id === confirmDeleteWeek._id) {
        setActiveWeek(null);
      }
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete week.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-display">
            Weekly Performance Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure weekly scorecards, set automatic or manual rankings, and broadcast to TVs.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-navy-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 flex items-center gap-2 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Performance Week</span>
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-start justify-between gap-3 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-200'
              : 'bg-rose-950/80 border border-rose-700/60 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Weeks List */}
      <div className="rounded-2xl glass-panel border border-slate-800 p-6">
        <h2 className="text-lg font-bold text-white font-display mb-4">Performance Weeks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weeks.map((week) => {
            const isCurrent = activeWeek?._id === week._id;
            return (
              <div
                key={week._id}
                className={`p-5 rounded-2xl border transition ${
                  isCurrent
                    ? 'border-amber-400 bg-navy-850 shadow-lg shadow-amber-500/10'
                    : 'border-slate-800 bg-navy-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                    {week.weekId}
                  </span>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      week.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {week.status}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base font-display truncate">{week.title}</h3>
                <div className="mt-1 flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400">Presented by</span>
                  <span className="text-amber-300 font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[11px]">
                    {week.presentedBy || 'Alpha Team'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {new Date(week.weekStartDate).toLocaleDateString()} –{' '}
                    {new Date(week.weekEndDate).toLocaleDateString()}
                  </span>
                </p>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenEditor(week)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-navy-800 hover:bg-navy-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{isCurrent ? 'Editing' : 'Manage'}</span>
                  </button>

                  <button
                    onClick={async () => {
                      const data = await fetchWeekById(week._id);
                      setPreviewWeek({ week: data.week, rankings: data.rankings });
                    }}
                    title="Preview TV Render"
                    className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-amber-400 transition"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {week.status === 'draft' && (
                    <button
                      onClick={() => setConfirmPublishWeek(week)}
                      title="Publish to TV"
                      className="p-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-400 transition"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => setConfirmDeleteWeek(week)}
                    title="Delete Week"
                    className="p-2 rounded-lg bg-navy-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Scorecard Editor View */}
      {activeWeek && (
        <div className="rounded-3xl glass-panel border border-amber-500/30 p-6 md:p-8 space-y-6 shadow-2xl relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
                  {activeWeek.weekId}
                </span>
                <span className="text-xs uppercase font-bold text-slate-400">
                  {activeWeek.status === 'published' ? 'Live Published' : 'Draft Status'}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white font-display mt-1">
                Leaderboard Scorecard: {activeWeek.title}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Ranking Mode Toggle */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-900 border border-slate-700 text-xs">
                <span className="text-slate-400 font-semibold">Mode:</span>
                <button
                  type="button"
                  onClick={() => setRankingMode('auto')}
                  className={`px-2 py-1 rounded-lg font-bold transition ${
                    rankingMode === 'auto'
                      ? 'bg-amber-400 text-navy-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Auto (By Score)
                </button>
                <button
                  type="button"
                  onClick={() => setRankingMode('manual')}
                  className={`px-2 py-1 rounded-lg font-bold transition ${
                    rankingMode === 'manual'
                      ? 'bg-amber-400 text-navy-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Manual Order
                </button>
              </div>

              <button
                type="button"
                onClick={() => setPreviewWeek({ week: activeWeek, rankings: rankingItems })}
                className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate TV Screen</span>
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveRankings}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-navy-950 font-bold text-xs uppercase tracking-wider shadow disabled:opacity-50 flex items-center gap-1.5 transition"
              >
                {isSaving ? 'Saving...' : 'Save Scorecard'}
              </button>

              {activeWeek.status === 'draft' && (
                <button
                  type="button"
                  onClick={() => setConfirmPublishWeek(activeWeek)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish to TVs</span>
                </button>
              )}
            </div>
          </div>

          {/* Performers Assigned */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-display">
                Top Performers on Leaderboard ({rankingItems.length}/10)
              </h3>
              {rankingItems.length < 10 && (
                <span className="text-xs text-amber-400">
                  Select team members from the employee directory below to add.
                </span>
              )}
            </div>

            {rankingItems.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 text-sm">
                No employees added to this weekly leaderboard yet. Click on employees below to assign them.
              </div>
            ) : (
              <div className="space-y-3">
                {rankingItems.map((item, index) => (
                  <div
                    key={item.employeeId}
                    className="p-4 rounded-2xl bg-navy-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Performer Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-navy-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-sm shrink-0">
                        #{rankingMode === 'auto' ? index + 1 : item.rank}
                      </div>
                      <AvatarWithFallback
                        src={item.imageUrl}
                        alt={item.fullName || item.employeeId}
                        className="w-10 h-10 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-white text-sm block">{item.fullName}</span>
                        <span className="text-xs text-slate-400 block">
                          {item.designation} • {item.department} ({item.employeeId})
                        </span>
                      </div>
                    </div>

                    {/* Score and Rank Inputs */}
                    <div className="flex flex-wrap items-center gap-3">
                      {rankingMode === 'manual' && (
                        <div className="flex items-center gap-1.5">
                          <label className="text-xs text-slate-400 font-semibold">Rank:</label>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={item.rank}
                            onChange={(e) => handleManualRankChange(item.employeeId, parseInt(e.target.value, 10))}
                            className="w-16 px-2.5 py-1.5 rounded-lg bg-navy-950 border border-slate-700 text-white text-xs font-bold"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        <label className="text-xs text-slate-400 font-semibold">Score (0-1000):</label>
                        <input
                          type="number"
                          min={0}
                          max={1000}
                          value={item.performanceScore}
                          onChange={(e) => handleScoreChange(item.employeeId, parseFloat(e.target.value))}
                          className="w-20 px-2.5 py-1.5 rounded-lg bg-navy-950 border border-slate-700 text-amber-300 font-mono text-xs font-bold"
                        />
                      </div>

                      <div className="flex-1 min-w-[200px]">
                        <input
                          type="text"
                          placeholder="Optional achievement highlight quote..."
                          value={item.achievementDescription || ''}
                          onChange={(e) => handleAchievementChange(item.employeeId, e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-navy-950 border border-slate-700 text-slate-200 text-xs focus:border-amber-400"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemovePerformer(item.employeeId)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                        title="Remove from leaderboard"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick-Add Active Employees Directory */}
          {rankingItems.length < 10 && (
            <div className="pt-6 border-t border-slate-800">
              <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3">
                Eligible Active Employees Directory
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {employees
                  .filter((emp) => !rankingItems.some((r) => r.employeeId === emp.employeeId))
                  .map((emp) => (
                    <button
                      key={emp.employeeId}
                      type="button"
                      onClick={() => handleAddEmployeeToRankings(emp)}
                      className="p-3 rounded-xl bg-navy-900/60 hover:bg-navy-800 border border-slate-800 flex items-center justify-between text-left transition group"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <AvatarWithFallback
                          src={emp.imageUrl}
                          alt={emp.fullName}
                          className="w-8 h-8 shrink-0"
                        />
                        <div className="truncate">
                          <p className="text-xs font-bold text-white truncate">{emp.fullName}</p>
                          <p className="text-[10px] text-slate-400 truncate">{emp.designation}</p>
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 ml-2" />
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Week Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl p-6 md:p-8 glass-panel border border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white font-display mb-1">Create Performance Week</h2>
            <p className="text-xs text-slate-400 mb-4">
              Draft a new leaderboard timeline for employee ranking.
            </p>

            <form onSubmit={handleCreateWeek} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Week ID (e.g. 2026-W43)
                </label>
                <input
                  type="text"
                  required
                  value={newWeekId}
                  onChange={(e) => setNewWeekId(e.target.value)}
                  placeholder="2026-W43"
                  className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white text-sm focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Week Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Q4 Sprint Championship"
                  className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white text-sm focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Presented By (Host Team)
                </label>
                <select
                  value={newPresentedBy}
                  onChange={(e) => setNewPresentedBy(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-amber-300 font-bold text-sm focus:border-amber-400"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-white text-sm focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-white text-sm focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-navy-950 font-bold text-sm tracking-wide shadow"
                >
                  Create Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewWeek && (
        <LeaderboardPreviewModal
          week={previewWeek.week}
          rankings={previewWeek.rankings}
          onClose={() => setPreviewWeek(null)}
          onPublish={() => {
            const target = previewWeek.week;
            setPreviewWeek(null);
            setConfirmPublishWeek(target);
          }}
        />
      )}

      {/* Confirmation Dialog: Publish */}
      {confirmPublishWeek && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl p-6 glass-panel border border-slate-700 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-display mb-2">Publish Weekly Results?</h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              This will officially publish{' '}
              <span className="font-semibold text-white">{confirmPublishWeek.title}</span> ({confirmPublishWeek.weekId})
              to all office television displays immediately.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmPublishWeek(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow"
              >
                Yes, Publish to TVs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Delete */}
      {confirmDeleteWeek && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl p-6 glass-panel border border-slate-700 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-display mb-2">Delete Performance Week?</h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-white">{confirmDeleteWeek.weekId}</span> and all associated rankings?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteWeek(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow"
              >
                Delete Week
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
