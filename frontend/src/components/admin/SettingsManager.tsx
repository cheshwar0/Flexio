import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle, Monitor, Sparkles, Terminal } from 'lucide-react';
import { fetchSettings, updateSettings } from '../../services/settingsService.js';
import { SettingsData } from '../../types/index.js';

export const SettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<SettingsData>({
    companyName: 'Flexio Global Technologies',
    companyLogoUrl: '',
    motivationalMessage: 'EXCELLENCE DESERVES RECOGNITION',
    carouselIntervalSeconds: 5,
    dataRefreshIntervalSeconds: 60,
    teamLeaderSlideDurationSeconds: 5,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings()
      .then((data) => setSettings(data))
      .catch((err) => setMessage({ type: 'error', text: 'Error loading settings.' }))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const updated = await updateSettings(settings);
      setSettings(updated);
      setMessage({ type: 'success', text: 'System branding and TV settings saved successfully.' });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to update settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-display">
          Branding & TV Kiosk Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Customize corporate visual identity, timing parameters, and full-screen TV kiosk automation.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-200'
              : 'bg-rose-950/80 border border-rose-700/60 text-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Form */}
        <div className="rounded-3xl glass-panel border border-slate-800 p-6 md:p-8 shadow-xl">
          <h2 className="text-lg font-bold text-white font-display mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <span>Display Branding Parameters</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Company Name
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white text-sm focus:border-amber-400"
                placeholder="e.g. Acme Corporation"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Company Logo URL or Relative Path
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  value={settings.companyLogoUrl}
                  onChange={(e) => setSettings({ ...settings, companyLogoUrl: e.target.value })}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white text-sm focus:border-amber-400"
                  placeholder="/flexio-logo.png or https://..."
                />
                {settings.companyLogoUrl && (
                  <div className="h-10 px-3 py-1 bg-navy-950 border border-slate-700 rounded-xl flex items-center justify-center shrink-0">
                    <img
                      src={settings.companyLogoUrl}
                      alt="Logo preview"
                      className="h-7 w-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Defaults to the official <span className="text-amber-400 font-mono">/flexio-logo.png</span>. You can also specify an external Cloudinary or hosted logo URL.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Default Presenter / Host Team (Header Branding)
              </label>
              <input
                type="text"
                value={settings.presentedBy || 'Alpha Team'}
                onChange={(e) => setSettings({ ...settings, presentedBy: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white text-sm focus:border-amber-400"
                placeholder="e.g. Alpha Team"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Displays in the TV header next to the corporate logo: <span className="text-amber-400 font-semibold">Presented by [Team]</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                TV Display Footer Motivational Slogan
              </label>
              <input
                type="text"
                value={settings.motivationalMessage}
                onChange={(e) => setSettings({ ...settings, motivationalMessage: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white text-sm focus:border-amber-400"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Performer Slide (sec)
                </label>
                <input
                  type="number"
                  min={3}
                  max={60}
                  value={settings.carouselIntervalSeconds}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      carouselIntervalSeconds: Math.max(3, parseInt(e.target.value, 10)),
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white text-sm focus:border-amber-400 font-mono"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">Default: 5s</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Leader Slide (sec)
                </label>
                <input
                  type="number"
                  min={3}
                  max={60}
                  value={settings.teamLeaderSlideDurationSeconds || 5}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      teamLeaderSlideDurationSeconds: Math.max(3, parseInt(e.target.value, 10)),
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white text-sm focus:border-amber-400 font-mono"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">Default: 5s</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Sync Refresh (sec)
                </label>
                <input
                  type="number"
                  min={10}
                  max={600}
                  value={settings.dataRefreshIntervalSeconds}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      dataRefreshIntervalSeconds: Math.max(10, parseInt(e.target.value, 10)),
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white text-sm focus:border-amber-400 font-mono"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">Default: 60s</p>
              </div>
            </div>


            <button
              type="submit"
              disabled={saving}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-navy-950 font-bold text-sm tracking-wide shadow flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
            </button>
          </form>
        </div>

        {/* TV Kiosk Mode Instructions Guide */}
        <div className="rounded-3xl glass-panel border border-slate-800 p-6 md:p-8 space-y-5 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Monitor className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white font-display">
              Office TV Full-Screen & Kiosk Mode Guide
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The public TV display URL <span className="font-mono text-amber-300">/display</span> is completely autonomous: it does not require mouse or keyboard input once running.
          </p>

          <div className="space-y-4 text-xs text-slate-300">
            {/* Windows Chrome/Edge Kiosk Command */}
            <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Terminal className="w-4 h-4" />
                <span>Windows Kiosk Mode Startup Command</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Create a desktop shortcut or startup script to open Chrome in locked-down kiosk mode:
              </p>
              <pre className="p-2.5 rounded-lg bg-navy-950 border border-slate-700 font-mono text-[11px] text-amber-200 overflow-x-auto select-all">
                chrome.exe --kiosk --incognito http://localhost:5173/display
              </pre>
              <p className="text-[10px] text-slate-500">
                Replace localhost:5173 with your deployed production Vercel URL.
              </p>
            </div>

            {/* Smart TV / Browser Mode */}
            <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 space-y-2">
              <span className="font-bold text-white block">Smart TV Built-in Browser</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                <li>Open the built-in browser on your TV or media stick (FireTV, AppleTV, Android TV).</li>
                <li>Navigate to your deployed website URL ending in <span className="text-amber-300">/display</span>.</li>
                <li>Press <span className="text-white font-semibold">F11</span> or click the hover fullscreen icon in the top-right corner to eliminate browser borders.</li>
                <li>Ensure TV power-saving screen shutoff is disabled during working hours.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
