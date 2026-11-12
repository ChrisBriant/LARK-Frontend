import React, { useState } from 'react';
import { Users, X, Trash2, Search, Plus } from 'lucide-react';

export default function MembersModal({ isOpen, group, onClose, allUsers = [], onAddMember, onRemoveMember }) {
  const [searchUser, setSearchUser] = useState('');
  const [loadingAction, setLoadingAction] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen || !group) return null;

  const currentMembers = group.members || [];

  const nonMembers = allUsers.filter((u) => {
    const userDn = u.dn || `uid=${u.uid},ou=People,dc=neuropunk`;
    const isMember =
      currentMembers.includes(userDn) || currentMembers.some((m) => m.includes(`uid=${u.uid},`) || m === u.uid);
    if (isMember) return false;
    if (!searchUser) return true;
    return (
      u.cn?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.uid?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.mail?.toLowerCase().includes(searchUser.toLowerCase())
    );
  });

  const handleAdd = async (userDn) => {
    setLoadingAction(`add-${userDn}`);
    setError(null);
    try {
      await onAddMember(group.dn, userDn);
      setSearchUser('');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to add member');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRemove = async (userDn) => {
    setLoadingAction(`remove-${userDn}`);
    setError(null);
    try {
      await onRemoveMember(group.dn, userDn);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to remove member');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Manage Members: {group.cn}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{group.dn}</p>
            </div>
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

        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Add User to Group
            </label>
            <div className="relative mb-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Search user by name or uid to add..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            {searchUser && (
              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white shadow-xs">
                {nonMembers.length === 0 ? (
                  <p className="p-3 text-xs text-slate-400 text-center">No available users found</p>
                ) : (
                  nonMembers.slice(0, 10).map((u) => {
                    const userDn = u.dn || `uid=${u.uid},ou=People,dc=neuropunk`;
                    const isProcessing = loadingAction === `add-${userDn}`;
                    return (
                      <div
                        key={u.uid}
                        className="px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-900">{u.cn}</span>
                            <span className="text-[10px] text-slate-500 font-mono">@{u.uid}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{u.mail}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAdd(userDn)}
                          disabled={Boolean(loadingAction)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium flex items-center gap-1 transition disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{isProcessing ? 'Adding...' : 'Add'}</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">
                Current Members ({currentMembers.length})
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
              {currentMembers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No members currently in this group.
                </div>
              ) : (
                currentMembers.map((memberDn) => {
                  const matchingUser = allUsers.find(
                    (u) => u.dn === memberDn || memberDn.includes(`uid=${u.uid},`) || memberDn === u.uid
                  );
                  return (
                    <div
                      key={memberDn}
                      className="p-3 flex items-center justify-between bg-white hover:bg-slate-50 transition group"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900 truncate">
                            {matchingUser?.cn || memberDn.split(',')[0]}
                          </span>
                          {matchingUser?.department && (
                            <span className="text-[10px] text-slate-500 hidden sm:inline">
                              · {matchingUser.department}
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-[10px] text-slate-400 truncate">{memberDn}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(memberDn)}
                        disabled={Boolean(loadingAction)}
                        title="Remove member from group"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
