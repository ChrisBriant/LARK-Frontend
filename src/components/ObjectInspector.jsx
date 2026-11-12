import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  User,
  Users,
  Folder,
  Mail,
  Briefcase,
  Building,
  ShieldAlert,
  ArrowRightLeft,
  Trash2,
  Edit,
  UserPlus,
  FolderPlus,
  ArrowLeft,
  X,
} from 'lucide-react';
import { canAdmin } from '../utils/role';
import logo from '../assets/logo.png';

export default function ObjectInspector({
  selectedNode,
  onClose,
  allGroups = [],
  allUsers = [],
  profile,
  onEditUser,
  onDeleteUser,
  onDisableUser,
  onMoveObject,
  onAddMemberToGroup,
  onRemoveMemberFromGroup,
  onCreateUserInOU,
  onCreateGroupInOU,
  onCreateSubOU,
  onSelectUserByDn,
}) {
  const [copiedDn, setCopiedDn] = useState(false);
  const isAdmin = canAdmin(profile?.role);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!selectedNode) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white border border-slate-200 rounded-2xl">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-3 mb-4">
          <img src={logo} alt="LARK Logo" className="w-full h-full object-contain opacity-60" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">No Object Selected</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
          Select an Organizational Unit, User account, or Group from the directory tree to inspect attributes.
        </p>
      </div>
    );
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedDn(true);
    setTimeout(() => setCopiedDn(false), 2000);
  };

  const renderTopExitBar = () => (
    <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
      {onClose ? (
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition"
          title="Return to Directory Tree (Esc)"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Directory Tree</span>
        </button>
      ) : (
        <div />
      )}

      {onClose && (
        <button
          onClick={onClose}
          className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
          title="Close card (Esc)"
        >
          <span>Close</span>
          <X className="w-3.5 h-3.5 ml-0.5" />
        </button>
      )}
    </div>
  );

  // 1. Root
  if (selectedNode.type === 'root') {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 h-full overflow-y-auto">
        {renderTopExitBar()}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 font-mono">{selectedNode.baseDn}</h2>
            <p className="text-xs text-slate-500">Root Directory Information Tree (DIT)</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Base DN
            </label>
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800">
              <span className="truncate">{selectedNode.baseDn}</span>
              <button onClick={() => copyToClipboard(selectedNode.baseDn)} className="text-slate-400 hover:text-slate-700 ml-2">
                {copiedDn ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isAdmin && (
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => onCreateSubOU?.(selectedNode.baseDn)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Create Root OU</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. User
  if (selectedNode.type === 'user') {
    const user = selectedNode.data;
    const userDn = user.dn || `uid=${user.uid},ou=People,dc=neuropunk`;
    const memberOf = allGroups.filter((g) => (g.members || []).some((m) => m.includes(`uid=${user.uid},`) || m === user.uid));

    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 h-full overflow-y-auto">
        {renderTopExitBar()}

        <div className="flex items-start justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-base">
              {user.given_name?.[0] || user.cn?.[0] || user.uid?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{user.cn}</h2>
                <span className="font-mono text-xs text-slate-500 font-normal">@{user.uid}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {user.title || 'Directory User'} {user.department ? `· ${user.department}` : ''}
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onEditUser?.(user)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition text-xs font-medium flex items-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={() => onMoveObject?.(userDn, user.cn)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition text-xs font-medium flex items-center gap-1"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Move</span>
              </button>
            </div>
          )}
        </div>

        <div className="mt-5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Distinguished Name (DN)
          </label>
          <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 break-all">
            <span className="select-all">{userDn}</span>
            <button onClick={() => copyToClipboard(userDn)} className="text-slate-400 hover:text-slate-700 ml-2 shrink-0 p-1">
              {copiedDn ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              UID
            </span>
            <p className="text-xs font-mono font-medium text-slate-800 mt-1">{user.uid}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email
            </span>
            <p className="text-xs font-medium text-indigo-600 mt-1 truncate">{user.mail}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              Department
            </span>
            <p className="text-xs font-medium text-slate-800 mt-1">{user.department || '—'}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              Title
            </span>
            <p className="text-xs font-medium text-slate-800 mt-1">{user.title || '—'}</p>
          </div>
        </div>

        {/* Group memberships */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Group Memberships ({memberOf.length})
          </label>
          {memberOf.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No assigned groups</p>
          ) : (
            <div className="space-y-1.5">
              {memberOf.map((grp) => (
                <div key={grp.dn} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{grp.cn}</span>
                    {grp.description && <span className="text-[11px] text-slate-500 truncate">· {grp.description}</span>}
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">Group</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin operations */}
        {isAdmin && (
          <div className="mt-8 pt-5 border-t border-slate-100 flex flex-wrap gap-2">
            <button
              onClick={() => onDisableUser?.(user)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-medium transition"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Disable Account</span>
            </button>
            <button
              onClick={() => onDeleteUser?.(user)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete User</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // 3. Group
  if (selectedNode.type === 'group') {
    const group = selectedNode.data;
    const members = group.members || [];

    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 h-full overflow-y-auto">
        {renderTopExitBar()}

        <div className="flex items-start justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{group.cn}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{group.description || 'LDAP Group'}</p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onAddMemberToGroup?.(group)}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
              <button
                onClick={() => onMoveObject?.(group.dn, group.cn)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition text-xs font-medium flex items-center gap-1"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Move</span>
              </button>
            </div>
          )}
        </div>

        <div className="mt-5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Group DN</label>
          <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 break-all">
            <span className="select-all">{group.dn}</span>
            <button onClick={() => copyToClipboard(group.dn)} className="text-slate-400 hover:text-slate-700 ml-2 shrink-0 p-1">
              {copiedDn ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-3">
            Members ({members.length})
          </label>
          {members.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
              No members enrolled.
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((memberDn) => {
                const matched = allUsers.find((u) => u.dn === memberDn || memberDn.includes(`uid=${u.uid},`) || memberDn === u.uid);
                return (
                  <div key={memberDn} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{matched?.cn || memberDn.split(',')[0]}</span>
                        {matched?.department && <span className="text-[10px] text-slate-500">· {matched.department}</span>}
                      </div>
                      <p className="font-mono text-[10px] text-slate-400 truncate">{memberDn}</p>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => onRemoveMemberFromGroup?.(group.dn, memberDn)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. OU
  if (selectedNode.type === 'ou') {
    const ou = selectedNode.data;
    const usersCount = ou.users?.length || 0;
    const groupsCount = ou.groups?.length || 0;

    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 h-full overflow-y-auto">
        {renderTopExitBar()}

        <div className="flex items-start justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 font-bold">
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{ou.ou}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{ou.description || 'Organizational Unit'}</p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => onMoveObject?.(ou.dn, ou.ou)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition text-xs font-medium flex items-center gap-1"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Move OU</span>
            </button>
          )}
        </div>

        <div className="mt-5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">OU DN</label>
          <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 break-all">
            <span className="select-all">{ou.dn}</span>
            <button onClick={() => copyToClipboard(ou.dn)} className="text-slate-400 hover:text-slate-700 ml-2 shrink-0 p-1">
              {copiedDn ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 block">Direct Users</span>
            <span className="text-lg font-bold text-slate-900">{usersCount}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 block">Groups</span>
            <span className="text-lg font-bold text-slate-900">{groupsCount}</span>
          </div>
        </div>

        {isAdmin && (
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-2">
            <button
              onClick={() => onCreateUserInOU?.(ou.dn)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New User in OU</span>
            </button>
            <button
              onClick={() => onCreateGroupInOU?.(ou.dn)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition"
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>New Group</span>
            </button>
            <button
              onClick={() => onCreateSubOU?.(ou.dn)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition"
            >
              <FolderPlus className="w-3.5 h-3.5 text-slate-500" />
              <span>New Sub-OU</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
