import React, { useState, useEffect } from 'react';
import {
  Users,
  Trophy,
  FileEdit,
  Tv,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
  Database,
  Cloud,
  Clock,
  Sparkles,
} from 'lucide-react';
import { fetchEmployees } from '../../services/employeeService.js';
import { fetchWeeks } from '../../services/weekService.js';
import { fetchSettings } from '../../services/settingsService.js';
import { Week } from '../../types/index.js';

interface DashboardOverviewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const [employeeCount, setEmployeeCount] = useState<number>(0);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchEmployees(), fetchWeeks(), fetchSettings()])
      .then(([empData, weekData]) => {
        setEmployeeCount(empData.filter((e) => e.active).length);
        setWeeks(weekData);
      })
      .catch((err) => console.error('Dashboard data fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const publishedWeek = weeks.find((w) => w.status === 'published');
  const draftWeeks = weeks.filter((w) => w.status === 'draft');

  return (
    <div className="space-y-8">
      {/* Welcome & Banner */}
      <div className="relative rounded-3xl p-8 glass-panel border border-slate-700/80 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Corporate TV Recognition Hub
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-display">
              Welcome to the HR Admin Dashboard
            </h1>
            <p className="text-slate-300 mt-2 text-sm md:text-base max-w-2xl leading-relaxed">
              Manage corporate employee records, formulate official weekly performance scorecards, and publish the Top 10 Performers directly to company televisions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('select-top10')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-navy-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 flex items-center gap-2 transition"
            >
              <Trophy className="w-4 h-4" />
              <span>Select Weekly Top 10</span>
            </button>
            <button
              onClick={() => window.open('/display', '_blank')}
              className="px-5 py-3 rounded-xl bg-navy-850 hover:bg-navy-800 border border-slate-700 text-white font-medium text-sm flex items-center gap-2 transition"
            >
              <Tv className="w-4 h-4 text-amber-400" />
              <span>Open TV Display</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Employees */}
        <div className="rounded-2xl p-6 glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Active Employees
            </p>
            <p className="text-3xl font-extrabold text-white font-display mt-2">
              {loading ? '...' : employeeCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">Eligible for weekly ranking</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Current Published Week */}
        <div className="rounded-2xl p-6 glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Active On Office TVs
            </p>
            <p className="text-xl font-bold text-amber-300 font-display mt-2 truncate max-w-[170px]">
              {loading ? '...' : publishedWeek ? publishedWeek.weekId : 'None Published'}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs text-emerald-400 font-medium">Broadcasting Live</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        {/* Drafts in Progress */}
        <div className="rounded-2xl p-6 glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Draft Weeks
            </p>
            <p className="text-3xl font-extrabold text-white font-display mt-2">
              {loading ? '...' : draftWeeks.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Pending HR sign-off</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-600/20 flex items-center justify-center text-amber-500">
            <FileEdit className="w-6 h-6" />
          </div>
        </div>

        {/* Carousel Rotation Timing */}
        <div className="rounded-2xl p-6 glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              TV Rotation Speed
            </p>
            <p className="text-3xl font-extrabold text-white font-display mt-2">5 sec</p>
            <p className="text-xs text-slate-500 mt-1">Automatic horizontal cycle</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* System Infrastructure Status */}
      <div className="rounded-3xl p-6 glass-panel border border-slate-800">
        <h2 className="text-lg font-bold text-white font-display mb-4">
          Integrated Architecture & Free Tier Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 flex items-center gap-3">
            <Database className="w-6 h-6 text-emerald-400" />
            <div>
              <p className="text-xs font-semibold text-white">MongoDB Database</p>
              <p className="text-[11px] text-slate-400">Atlas M0 Free Tier / Local Storage</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />
          </div>

          <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 flex items-center gap-3">
            <Cloud className="w-6 h-6 text-sky-400" />
            <div>
              <p className="text-xs font-semibold text-white">Cloudinary Asset Storage</p>
              <p className="text-[11px] text-slate-400">Auto face-crop & responsive CDN</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-sky-400 ml-auto" />
          </div>

          <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 flex items-center gap-3">
            <Tv className="w-6 h-6 text-amber-400" />
            <div>
              <p className="text-xs font-semibold text-white">TV Fullscreen Kiosk Mode</p>
              <p className="text-[11px] text-slate-400">1080p & 4K 16:9 Landscape</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-amber-400 ml-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};
