import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, ArrowRight, Server, Shield, BookOpen, Users } from 'lucide-react';
import logo from '../assets/logo.png';
import { login } from '../network/auth';

export default function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await login(username.trim(), password);
      if (onLoginSuccess) {
        onLoginSuccess(res.profile);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Authentication failed. Please verify credentials.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center p-2.5 mb-3">
            <img src={logo} alt="LARK Mascot" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">LARK</h1>
          <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mt-0.5">
            LDAP Administration & Resource Kit
          </p>
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-600">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-slate-600">dc=neuropunk</span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-700 font-medium">Directory Ready</span>
          </div>
        </div>

        <div className="bg-white py-8 px-6 sm:px-10 border border-slate-200 rounded-2xl shadow-xs">
          {errorMessage && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              <span className="font-semibold">Sign In Failed: </span>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Username or UID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alovelace, jsmith, duser"
                  className="block w-full pl-9 pr-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter LDAP password"
                  className="block w-full pl-9 pr-10 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 transition"
              >
                {submitting ? 'Authenticating...' : 'Sign In to Directory'}
                {!submitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>

          {/* Quick presets for testing */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Role Testing Presets
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('duser', 'UpL82N!ght')}
                className="text-left p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">DEMO_USERS</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">duser</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Read & browse directory tree structure.</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('alovelace', 'LowBattery64=')}
                className="text-left p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">GLOBAL_ADMIN</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">alovelace</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Full administrative actions: create, update, delete, move.</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('jsmith', 'StrongArm12?')}
                className="text-left p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">GLOBAL_READER</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">jsmith</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Read-only directory auditor access.</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
