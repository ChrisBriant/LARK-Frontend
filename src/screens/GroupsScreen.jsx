import React, { useState } from 'react';
import { Users, Search, Plus, UserPlus, ArrowRightLeft, ChevronRight } from 'lucide-react';
import { canAdmin } from '../utils/role';

export default function GroupsScreen({
  groups = [],
  allUsers = [],
  loading,
  profile,
  onCreateGroup,
  onManageMembers,
  onMoveGroup,
  onSelectUserByDn,
}) {
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const isAdmin = canAdmin(profile?.role);

  const filteredGroups = groups.filter((g) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      g.cn?.toLowerCase().includes(q) ||
      g.description?.toLowerCase().includes(q) ||
      g.dn?.toLowerCase().includes(q)
    );
  });

  const activeGroup = selectedGroup || (filteredGroups.length > 0 ? filteredGroups[0] : null);

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search directory groups..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-500 font-medium px-2">
            {filteredGroups.length} groups
          </div>
          {isAdmin && (
            <button
              onClick={onCreateGroup}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Group</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-235px)] min-h-[520px]">
        {/* Left list */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl flex flex-col h-full shadow-xs overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Groups</span>
            <span className="text-[11px] font-mono text-slate-400">groupOfNames</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading groups...</div>
            ) : filteredGroups.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">No groups match search.</div>
            ) : (
              filteredGroups.map((g) => {
                const isSelected = activeGroup?.dn === g.dn;
                const membersCount = g.members?.length || 0;

                return (
                  <div
                    key={g.dn}
                    onClick={() => setSelectedGroup(g)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${
                      isSelected ? 'bg-slate-900 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <Users className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-300' : 'text-emerald-600'}`} />
                        <span className="text-xs font-semibold truncate">{g.cn}</span>
                      </div>
                      {g.description && (
                        <p className={`text-[11px] mt-0.5 truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {g.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isSelected ? 'bg-white/10 text-slate-200' : 'bg-slate-100 text-slate-600'}`}>
                        {membersCount}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right roster */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl flex flex-col h-full shadow-xs overflow-hidden">
          {activeGroup ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-start justify-between pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{activeGroup.cn}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{activeGroup.description || 'No description'}</p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onManageMembers(activeGroup)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Manage Members</span>
                    </button>
                    <button
                      onClick={() => onMoveGroup(activeGroup)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                      title="Move Group"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Distinguished Name
                </label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 break-all select-all">
                  {activeGroup.dn}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Members ({activeGroup.members?.length || 0})
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => onManageMembers(activeGroup)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      + Add / Remove
                    </button>
                  )}
                </div>

                {!activeGroup.members || activeGroup.members.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    No members assigned.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeGroup.members.map((memberDn) => {
                      const user = allUsers.find(
                        (u) => u.dn === memberDn || memberDn.includes(`uid=${u.uid},`) || memberDn === u.uid
                      );
                      return (
                        <div
                          key={memberDn}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition"
                        >
                          <div className="min-w-0 pr-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-900">{user?.cn || memberDn.split(',')[0]}</span>
                              {user?.department && <span className="text-[10px] text-slate-500">· {user.department}</span>}
                            </div>
                            <p className="font-mono text-[10px] text-slate-400 truncate mt-0.5">{memberDn}</p>
                          </div>

                          {user && onSelectUserByDn && (
                            <button
                              onClick={() => onSelectUserByDn(memberDn)}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium shrink-0"
                            >
                              View
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-center text-xs text-slate-400">
              Select a group from the list.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
