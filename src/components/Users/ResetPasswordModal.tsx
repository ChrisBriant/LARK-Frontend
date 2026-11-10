import React, { useState } from 'react';
import { LDAPUser } from '../../types/ldap';
import { KeyRound, X, Check, Copy } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface ResetPasswordModalProps {
  isOpen: boolean;
  user: LDAPUser | null;
  onClose: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  user,
  onClose,
}) => {
  const { success, info } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!isOpen || !user) return null;

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 14; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    info('Password copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      generateRandomPassword();
      return;
    }
    setSubmitting(true);
    try {
      // Simulate password reset on LDAP directory
      await new Promise((resolve) => setTimeout(resolve, 600));
      setCompleted(true);
      success(`Password reset generated for ${user.cn}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDone = () => {
    setCompleted(false);
    setNewPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-slate-900">
            <KeyRound className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Reset User Password</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
              {user.given_name?.[0] || 'U'}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">{user.cn}</p>
              <p className="text-[11px] text-slate-500 font-mono">uid: {user.uid} · {user.mail}</p>
            </div>
          </div>

          {!completed ? (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    New Secure Password
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Generate Random
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter or generate temporary password"
                    className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-slate-900"
                  />
                  {newPassword && (
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="p-2.5 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition shrink-0"
                      title="Copy password"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mt-1.5">
                  This issues a directory password reset with one-time credentials for user login.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Applying...' : 'Apply Password Reset'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-800">
                Password updated successfully. Share these temporary credentials with the user:
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900">
                <span className="font-semibold select-all">{newPassword}</span>
                <button
                  onClick={handleCopy}
                  className="text-slate-400 hover:text-slate-700 ml-2"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={handleDone}
                  className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
