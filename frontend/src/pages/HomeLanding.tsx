import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, ShieldCheck, Sparkles, Trophy, ArrowRight, Monitor, Layers, Lock, Cpu } from 'lucide-react';

export const HomeLanding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black relative overflow-hidden">
      {/* Background glow ambiance */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Navbar */}
      <nav className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block">
              ENTERPRISE RECOGNITION
            </span>
            <span className="text-lg font-black text-white tracking-tight font-display">
              Weekly Top 10 Performers
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/login')}
            className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-850 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>HR Admin Portal</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-20 text-center flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Corporate Office Television Display System
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-display mb-6 leading-tight">
          Celebrate Corporate <br />
          <span className="gold-gradient-text uppercase">Excellence Every Week</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed mb-10">
          Autonomous full-screen leaderboard designed for company television displays. Features automatic 5-second continuous carousel transitions, MongoDB Atlas cloud persistence, and a secure HR administration suite.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => navigate('/display')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-navy-950 font-black text-base tracking-wide shadow-xl shadow-amber-500/25 flex items-center justify-center gap-3 transition transform hover:-translate-y-0.5"
          >
            <Tv className="w-5 h-5 stroke-[2.5]" />
            <span>Launch TV Display Screen</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>

          <button
            onClick={() => navigate('/admin/login')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-navy-900/90 hover:bg-navy-850 border border-slate-700 text-white font-bold text-base tracking-wide flex items-center justify-center gap-2.5 transition backdrop-blur-md"
          >
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>HR Administration Suite</span>
          </button>
        </div>

        {/* Features highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 w-full text-left">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <Monitor className="w-6 h-6 text-amber-400 mb-3" />
            <h3 className="font-bold text-white text-base font-display">5-Second Auto Carousel</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Autonomous horizontal cycle showing cards smoothly on 1080p & 4K screens without manual input.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <Layers className="w-6 h-6 text-sky-400 mb-3" />
            <h3 className="font-bold text-white text-base font-display">Cloud Storage & Images</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Backed by MongoDB Atlas M0 Free Cluster and Cloudinary with facial recognition auto-cropping.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <Cpu className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-bold text-white text-base font-display">60-Sec Independent Sync</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Background live sync updates newly published leaderboards without interrupting the carousel rotation.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>Flexio Corporate Recognition System • "Excellence Deserves Recognition"</p>
      </footer>
    </div>
  );
};
