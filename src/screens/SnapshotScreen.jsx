import React, { useState } from 'react';
import { Search, Download, Users, Shield, Folder, Server, Check, Copy } from 'lucide-react';

export default function SnapshotScreen({ snapshot, loading }) {
  const [activeSubTab, setActiveSubTab] = useState('users');
  const [search, setSearch] = useState('');
  const [copiedRaw, setCopiedRaw] = useState(false);

  const baseDn = snapshot?.base_dn || 'dc=neuropunk';
  const users = snapshot?.users || [];
  const groups = snapshot?.groups || [];
  const ous = snapshot?.ous || [];

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.cn?.toLowerCase().includes(q) ||
      u.uid?.toLowerCase().includes(q) ||
      u.mail?.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q)
    );
  });

  const filteredGroups = groups.filter((g) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      g.cn?.toLowerCase().includes(q) ||
      g.description?.toLowerCase().includes(q) ||
      g.dn?.toLowerCase().includes(q)
    );
  });

  const filteredOus = ous.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return o.ou?.toLowerCase().includes(q) || o.dn?.toLowerCase().includes(q);
  });

  const handleDownloadJson = () => {
    if (!snapshot) return;
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lark-ldap-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyRaw = () => {
    if (!snapshot) return;
    navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2));
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Metric Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 font-medium block">Base Domain</span>
            <span className="font-mono text-xs font-bold text-slate-900 truncate block">{baseDn}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Total Users</span>
            <span className="text-lg font-bold text-slate-900">{users.length}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Total Groups</span>
            <span className="text-lg font-bold text-slate-900">{groups.length}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Total OUs</span>
            <span className="text-lg font-bold text-slate-900">{ous.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'users' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveSubTab('groups')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'groups' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Groups ({groups.length})
          </button>
          <button
            onClick={() => setActiveSubTab('ous')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'ous' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            OUs ({ous.length})
          </button>
          <button
            onClick={() => setActiveSubTab('raw')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'raw' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Raw JSON
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab !== 'raw' && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search snapshot..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900"
              />
            </div>
          )}

          <button
            onClick={handleDownloadJson}
            disabled={!snapshot || loading}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading snapshot data...</div>
        ) : activeSubTab === 'raw' ? (
          <div className="relative p-4">
            <button
              onClick={handleCopyRaw}
              className="absolute top-6 right-6 flex items-center gap-1.5 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 shadow-xs"
            >
              {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
            <pre className="p-4 bg-slate-900 text-slate-200 text-xs font-mono rounded-xl max-h-[500px] overflow-auto select-all leading-relaxed">
              {JSON.stringify(snapshot, null, 2)}
            </pre>
          </div>
        ) : activeSubTab === 'users' ? (
          <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">UID</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">DN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No users match query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{u.cn}</td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600">{u.uid}</td>
                      <td className="py-2.5 px-4 text-slate-600">{u.mail}</td>
                      <td className="py-2.5 px-4 text-slate-600">{u.department || '—'}</td>
                      <td className="py-2.5 px-4 font-mono text-[10px] text-slate-400 truncate max-w-xs">{u.dn}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : activeSubTab === 'groups' ? (
          <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">Group</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Members</th>
                  <th className="py-3 px-4">DN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredGroups.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      No groups match query.
                    </td>
                  </tr>
                ) : (
                  filteredGroups.map((g) => (
                    <tr key={g.dn} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{g.cn}</td>
                      <td className="py-2.5 px-4 text-slate-600">{g.description || '—'}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-700">{g.members?.length || 0}</td>
                      <td className="py-2.5 px-4 font-mono text-[10px] text-slate-400 truncate max-w-xs">{g.dn}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">OU Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">DN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredOus.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500">
                      No organizational units match query.
                    </td>
                  </tr>
                ) : (
                  filteredOus.map((o) => (
                    <tr key={o.dn} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{o.ou}</td>
                      <td className="py-2.5 px-4 text-slate-600">{o.description || '—'}</td>
                      <td className="py-2.5 px-4 font-mono text-[10px] text-slate-400 truncate max-w-xs">{o.dn}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
