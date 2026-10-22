import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  AlertCircle,
  ArrowRight,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import {
  checkSetupStatus,
  setupFirstAdmin,
  loginAdmin,
  resetAdminPassword,
} from '../../services/authService.js';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Check if initial admin setup is required
    checkSetupStatus()
      .then((res) => {
        if (res.setupNeeded) {
          setIsSetupMode(true);
        }
      })
      .catch((err) => {
        console.warn('Could not check setup status:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      if (isSetupMode) {
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (!email.trim()) throw new Error('Please enter a valid corporate email.');
        if (password.length < 8) throw new Error('Password must be at least 8 characters long.');

        await setupFirstAdmin({ name, email, password });
      } else {
        await loginAdmin({ email, password });
      }

      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      if (!email.trim()) throw new Error('Please enter your corporate email.');
      if (newPassword.length < 8) throw new Error('New password must be at least 8 characters long.');
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match. Please ensure both passwords are identical.');
      }

      const res = await resetAdminPassword({ email: email.trim(), newPassword });
      setSuccessMessage(res.message || 'Password reset successfully! Logging you in...');

      // Smooth transition to dashboard
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Password reset failed. Please check details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-md p-8 md:p-10 rounded-3xl glass-panel border border-slate-700/80 shadow-2xl z-10">
        {/* Official Flexio Logo Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <img
            src="/flexio-logo.png"
            alt="FLEXIO"
            className="h-12 w-auto max-w-[200px] object-contain mb-4 drop-shadow-lg"
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            {isForgotMode ? (
              <>
                <KeyRound className="w-3.5 h-3.5" />
                <span>Password Recovery</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Corporate Portal</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-display">
            {isSetupMode
              ? 'Admin Initialization'
              : isForgotMode
              ? 'Reset Portal Password'
              : 'HR Leadership Login'}
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            {isSetupMode
              ? 'Create the primary administrator account to secure the recognition system.'
              : isForgotMode
              ? 'Enter your corporate email and set a new password to regain portal access.'
              : 'Enter your authorized credentials to manage performers and weekly leaderboards.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/80 border border-rose-700/70 text-rose-200 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700/70 text-emerald-200 text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* FORGOT / RESET PASSWORD FORM */}
        {isForgotMode ? (
          <form onSubmit={handleResetSubmit} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Corporate Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="reset-email"
                  name="reset_corporate_email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reset-new-password"
                  name="reset_new_password"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 8 chars)"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-navy-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Must be at least 8 characters long</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reset-confirm-password"
                  name="reset_confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-navy-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-navy-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Update Password & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsForgotMode(false);
                setError(null);
                setSuccessMessage(null);
              }}
              className="w-full py-2.5 px-4 rounded-xl text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </form>
        ) : (
          /* STANDARD SIGN IN / SETUP FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-4" autoComplete="off">
            {isSetupMode && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Corporate Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="portal-email"
                  name="portal_user_email"
                  type="email"
                  required
                  autoComplete="off"
                  readOnly
                  onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                {!isSetupMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(true);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="portal-password"
                  name="portal_user_secret"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  readOnly
                  onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-navy-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isSetupMode && (
                <p className="text-[11px] text-slate-400 mt-1">Must be at least 8 characters long</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-navy-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSetupMode ? 'Initialize Administrator' : 'Sign In to Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Portal corporate inspirational slogan */}
        {!isSetupMode && (
          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-amber-400/90 font-medium tracking-wide italic">
              &ldquo;Recognizing Today&rsquo;s Champions, Inspiring Tomorrow&rsquo;s Leaders.&rdquo;
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/display')}
            className="text-xs text-slate-400 hover:text-amber-300 transition flex items-center justify-center gap-1.5 mx-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Switch to TV Full-Screen Display</span>
          </button>
        </div>
      </div>
    </div>
  );
};
