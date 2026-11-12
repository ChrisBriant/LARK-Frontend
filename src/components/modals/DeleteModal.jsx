import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DeleteModal({ isOpen, user, onClose, onConfirm }) {
  const [confirmUid, setConfirmUid] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !user) return null;

  const isMatch = confirmUid.trim() === user.uid;

  const handleDelete = async () => {
    if (!isMatch) return;
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(user.uid);
      setConfirmUid('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to delete user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">Delete User Account</h3>
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
            Are you sure you want to permanently delete user <strong className="text-slate-900">{user.cn}</strong> (<span className="font-mono">{user.uid}</span>)?
          </p>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-700 break-all">
            {user.dn || `uid=${user.uid},ou=People,dc=neuropunk`}
          </div>

          <div className="text-xs text-slate-500">
            Type <strong className="font-mono text-slate-900 select-all">{user.uid}</strong> below to confirm deletion:
          </div>

          <input
            type="text"
            value={confirmUid}
            onChange={(e) => setConfirmUid(e.target.value)}
            placeholder={`Type ${user.uid} here`}
            className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-600"
          />

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
              onClick={handleDelete}
              disabled={!isMatch || submitting}
              className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition shadow-xs disabled:opacity-40"
            >
              {submitting ? 'Deleting...' : 'Delete User'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
