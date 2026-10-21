import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Trophy,
  History,
  Settings,
  Tv,
  LogOut,
  Sparkles,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { getStoredAdminUser, logoutAdmin } from '../../services/authService.js';
import { AdminUser } from '../../types/index.js';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token = localStorage.getItem('flexio_admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }
    const user = getStoredAdminUser();
    setAdminUser(user);
  }, [navigate, token]);

  if (!token) {
    return null;
  }

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'select-top10', label: 'Select Weekly Top 10', icon: Trophy },
    { id: 'employees', label: 'Permanent Directory', icon: Users },
    { id: 'teams', label: 'Team Management', icon: Shield },
    { id: 'history', label: 'Historical Archives', icon: History },
    { id: 'settings', label: 'Branding & TV Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-navy-900 border-r border-slate-800 p-6 justify-between shrink-0">
        <div>
          {/* Official Flexio Logo Brand */}
          <div className="flex flex-col gap-2 mb-8 px-2">
            <img
              src="/flexio-logo.png"
              alt="FLEXIO"
              className="h-9 w-auto max-w-[180px] object-contain object-left drop-shadow"
            />
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-amber-500/15 border border-amber-500/30 text-amber-400">
                ADMIN PORTAL
              </span>
              <span className="text-xs font-semibold text-slate-400">Top 10 Display</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-navy-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          {/* Direct Launch TV Button */}
          <button
            onClick={() => window.open('/display', '_blank')}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-navy-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-amber-500/10 transition"
          >
            <Tv className="w-4 h-4" />
            <span>Launch TV Screen</span>
          </button>

          {/* Admin Profile Box */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-navy-950 border border-slate-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-navy-800 border border-slate-700 flex items-center justify-center text-amber-400">
                <Shield className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{adminUser?.name || 'Administrator'}</p>
                <p className="text-[10px] text-slate-400 truncate">{adminUser?.email || 'admin@internal'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-navy-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <img src="/flexio-logo.png" alt="FLEXIO" className="h-7 w-auto object-contain" />
          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-bold uppercase tracking-wider">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open('/display', '_blank')}
            className="p-2 rounded-lg bg-amber-500/20 text-amber-400"
          >
            <Tv className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-navy-800 text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-900 border-b border-slate-800 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm ${
                  isActive ? 'bg-amber-500/10 text-amber-400 font-bold' : 'text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-400 text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Panel Content View */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
};
