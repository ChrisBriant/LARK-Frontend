import React, { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export default function DisableModal({ isOpen, user, onClose, onConfirm }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !user) return null;

  const handleDisable = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(user.uid);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to disable user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-amber-600">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">Disable User Account</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Disabling <strong className="text-slate-900">{user.cn}</strong> (<span className="font-mono">{user.uid}</span>) will block authentication to all directory services.
          </p>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            This issues an LDAP account lock/disable mutation on the backend server.
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDisable}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Disabling...' : 'Confirm Disable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
