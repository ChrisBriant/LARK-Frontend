import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff, Lock, User, Shield, BookOpen, Users, ArrowRight, Server } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const { error: toastError } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await login(username.trim(), password);
    } catch (err: any) {
      const msg = err.message || 'Invalid username or password';
      setErrorMessage(msg);
      toastError('Sign in failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background architectural grid pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-center p-2.5 overflow-hidden">
              <img
                src="/assets/aistudio/LARK_Mascot_ac195d74.png"
                alt="LARK Mascot"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            LARK
          </h1>
          <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mt-0.5">
            LDAP Administration & Resource Kit
          </p>
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-600">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-slate-600">dc=neuropunk</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">Directory Online</span>
          </div>
        </div>

        <div className="bg-white py-8 px-6 sm:px-10 border border-slate-200/80 rounded-2xl shadow-sm">
          {errorMessage && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200/60 rounded-xl text-xs text-rose-700">
              <span className="font-semibold">Authentication failed: </span>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Username or UID
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alovelace, jsmith, duser"
                  className="block w-full pl-9 pr-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter LDAP password"
                  className="block w-full pl-9 pr-10 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-60 transition"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Directory</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick-fill access accounts */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-3">
              Role Access & Testing Presets
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('duser', 'UpL82N!ght')}
                className="text-left p-2.5 rounded-lg border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">DEMO_USERS</span>
                  </div>
                  <span className="text-[10px] text-slate-600">uid: duser</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Read and explore the entire directory tree and snapshot.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('alovelace', 'LowBattery64=')}
                className="text-left p-2.5 rounded-lg border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">GLOBAL_ADMIN</span>
                  </div>
                  <span className="text-[10px] text-slate-600">uid: alovelace</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Full administrative powers: create, update, delete, disable, move objects.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('jsmith', 'StrongArm12?')}
                className="text-left p-2.5 rounded-lg border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">GLOBAL_READER</span>
                  </div>
                  <span className="text-[10px] text-slate-600">uid: jsmith</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Audit and inspect every user, group, and OU across the directory.
                </p>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          LARK connects directly to your OpenLDAP directory server via REST API
        </p>
      </div>
    </div>
  );
};
