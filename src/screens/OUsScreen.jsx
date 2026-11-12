import React, { useState } from 'react';
import { Folder, Plus, Search, ArrowRightLeft, Copy, Check } from 'lucide-react';
import { canAdmin } from '../utils/role';

export default function OUsScreen({ ous = [], loading, profile, onCreateOU, onMoveOU }) {
  const [search, setSearch] = useState('');
  const [copiedDn, setCopiedDn] = useState(null);
  const isAdmin = canAdmin(profile?.role);

  const filteredOus = ous.filter((ou) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return ou.ou?.toLowerCase().includes(q) || ou.dn?.toLowerCase().includes(q);
  });

  const handleCopy = (dn) => {
    navigator.clipboard.writeText(dn);
    setCopiedDn(dn);
    setTimeout(() => setCopiedDn(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizational units..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">{filteredOus.length} units</span>
          {isAdmin && (
            <button
              onClick={onCreateOU}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create OU</span>
            </button>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">Loading organizational units...</div>
        ) : filteredOus.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500">No organizational units found.</div>
        ) : (
          filteredOus.map((ou) => (
            <div
              key={ou.dn}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-xs transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold">
                      <Folder className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{ou.ou}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{ou.description || 'Organizational Unit'}</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => onMoveOU(ou)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      title="Move OU"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Distinguished Name
                  </label>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[10px] text-slate-700 break-all">
                    <span className="truncate">{ou.dn}</span>
                    <button onClick={() => handleCopy(ou.dn)} className="text-slate-400 hover:text-slate-700 ml-1.5 shrink-0">
                      {copiedDn === ou.dn ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
