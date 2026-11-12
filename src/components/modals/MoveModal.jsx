import React, { useState } from 'react';
import { ArrowRightLeft, X, Folder } from 'lucide-react';

export default function MoveModal({ isOpen, onClose, currentDn, objectName, allOus = [], onConfirmMove }) {
  const [selectedParentDn, setSelectedParentDn] = useState(
    allOus.length > 0 ? allOus[0].dn : 'ou=People,dc=neuropunk'
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleMove = async (e) => {
    e.preventDefault();
    if (!selectedParentDn) {
      setError('Please select a target destination OU');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onConfirmMove(currentDn, selectedParentDn);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to move object');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-slate-900">
            <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Move Directory Object</h3>
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

        <form onSubmit={handleMove} className="p-6 space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Current Object
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs font-bold text-slate-900 block">{objectName}</span>
              <span className="font-mono text-[11px] text-slate-600 break-all block mt-0.5">{currentDn}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Select Target Destination OU
            </label>
            <div className="space-y-1.5 max-h-56 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50">
              {allOus.map((ou) => {
                const isSelected = selectedParentDn === ou.dn;
                return (
                  <div
                    key={ou.dn}
                    onClick={() => setSelectedParentDn(ou.dn)}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition text-xs ${
                      isSelected
                        ? 'bg-slate-900 text-white font-medium'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-amber-500'}`} />
                      <span className="font-semibold">{ou.ou}</span>
                    </div>
                    <span className={`font-mono text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      {ou.dn}
                    </span>
                  </div>
                );
              })}
            </div>
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
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Moving...' : 'Execute Move'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
