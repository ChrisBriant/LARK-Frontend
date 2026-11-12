import React, { useState } from 'react';
import { Users, X, Plus } from 'lucide-react';

export default function GroupModal({ isOpen, onClose, onSubmit, allUsers = [] }) {
  const [cn, setCn] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const filteredUsers = allUsers.filter(
    (u) =>
      !selectedMembers.includes(u.dn || `uid=${u.uid},ou=People,dc=neuropunk`) &&
      (u.cn?.toLowerCase().includes(memberSearch.toLowerCase()) ||
        u.uid?.toLowerCase().includes(memberSearch.toLowerCase()))
  );

  const toggleMember = (userDn) => {
    if (selectedMembers.includes(userDn)) {
      setSelectedMembers(selectedMembers.filter((m) => m !== userDn));
    } else {
      setSelectedMembers([...selectedMembers, userDn]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cn.trim()) {
      setError('Group common name (cn) is required');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        cn: cn.trim(),
        description: description.trim() || null,
        members: selectedMembers,
        object_classes: ['top', 'groupOfNames'],
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to create group');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-slate-900">
            <Users className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Create New Group</h3>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Group Name (cn) *
            </label>
            <input
              type="text"
              required
              value={cn}
              onChange={(e) => setCn(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              placeholder="e.g. dev-team, ops-auditors"
              className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Core Engineering Platform Team"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Members ({selectedMembers.length} selected)
            </label>
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2 max-h-24 overflow-y-auto p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                {selectedMembers.map((m) => {
                  const u = allUsers.find((user) => (user.dn || `uid=${user.uid},ou=People,dc=neuropunk`) === m);
                  return (
                    <span
                      key={m}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-white border border-slate-200 text-slate-800"
                    >
                      <span>{u?.cn || m.split(',')[0]}</span>
                      <button
                        type="button"
                        onClick={() => toggleMember(m)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            <input
              type="text"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Search user to add..."
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-slate-900"
            />

            {memberSearch && (
              <div className="mt-1 max-h-36 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
                {filteredUsers.length === 0 ? (
                  <p className="p-2 text-xs text-slate-400 text-center">No users match query</p>
                ) : (
                  filteredUsers.slice(0, 10).map((u) => {
                    const dn = u.dn || `uid=${u.uid},ou=People,dc=neuropunk`;
                    return (
                      <button
                        key={u.uid}
                        type="button"
                        onClick={() => {
                          toggleMember(dn);
                          setMemberSearch('');
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold text-slate-900">{u.cn}</span>
                          <span className="font-mono text-[10px] text-slate-500 ml-1.5">@{u.uid}</span>
                        </div>
                        <Plus className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    );
                  })
                )}
              </div>
            )}
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
              {submitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
