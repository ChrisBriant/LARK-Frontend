import React, { useState } from 'react';
import { LDAPOU } from '../../types/ldap';
import { useAuth } from '../../context/AuthContext';
import {
  Folder,
  Plus,
  Search,
  ArrowRightLeft,
  Copy,
  Check,
  Layers,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface OUsViewProps {
  ous: LDAPOU[];
  loading: boolean;
  onCreateOU: () => void;
  onMoveOU: (ou: LDAPOU) => void;
}

export const OUsView: React.FC<OUsViewProps> = ({
  ous,
  loading,
  onCreateOU,
  onMoveOU,
}) => {
  const { isGlobalAdmin } = useAuth();
  const { info } = useToast();
  const [search, setSearch] = useState('');
  const [copiedDn, setCopiedDn] = useState<string | null>(null);

  const filteredOus = ous.filter((ou) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return ou.ou.toLowerCase().includes(q) || ou.dn.toLowerCase().includes(q);
  });

  const handleCopy = (dn: string) => {
    navigator.clipboard.writeText(dn);
    setCopiedDn(dn);
    info('Copied DN to clipboard', dn);
    setTimeout(() => setCopiedDn(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizational units by name, dn..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">
            {filteredOus.length} of {ous.length} units
          </span>

          {isGlobalAdmin && (
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

      {/* OU Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            Loading organizational units...
          </div>
        ) : filteredOus.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500">
            No organizational units match your query.
          </div>
        ) : (
          filteredOus.map((ou) => (
            <div
              key={ou.dn}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-slate-300 hover:shadow-xs transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold">
                      <Folder className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{ou.ou}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {ou.description || 'Organizational Unit'}
                      </p>
                    </div>
                  </div>

                  {isGlobalAdmin && (
                    <button
                      onClick={() => onMoveOU(ou)}
                      title="Move OU to another parent"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Distinguished Name
                  </label>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/60 font-mono text-[10px] text-slate-700 break-all">
                    <span className="truncate">{ou.dn}</span>
                    <button
                      onClick={() => handleCopy(ou.dn)}
                      className="text-slate-400 hover:text-slate-700 ml-1.5 shrink-0"
                      title="Copy DN"
                    >
                      {copiedDn === ou.dn ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {ou.object_classes && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {ou.object_classes.map((oc) => (
                    <span
                      key={oc}
                      className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-100 text-slate-600"
                    >
                      {oc}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
