import React, { useState, useEffect } from 'react';
import {
  SelectedNode,
  LDAPUser,
  LDAPGroup,
  LDAPTreeOU,
} from '../../types/ldap';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Copy,
  Check,
  User,
  Users,
  Folder,
  Mail,
  Briefcase,
  Building,
  KeyRound,
  ShieldAlert,
  ArrowRightLeft,
  Trash2,
  Edit,
  UserPlus,
  FolderPlus,
  ExternalLink,
  ArrowLeft,
  X,
} from 'lucide-react';

interface ObjectDetailPaneProps {
  selectedNode: SelectedNode | null;
  onClose?: () => void;
  allGroups?: LDAPGroup[];
  allUsers?: LDAPUser[];
  onEditUser?: (user: LDAPUser) => void;
  onDeleteUser?: (user: LDAPUser) => void;
  onDisableUser?: (user: LDAPUser) => void;
  onMoveObject?: (dn: string, name: string) => void;
  onResetPassword?: (user: LDAPUser) => void;
  onAddMemberToGroup?: (group: LDAPGroup) => void;
  onRemoveMemberFromGroup?: (groupDn: string, userDn: string) => void;
  onCreateUserInOU?: (parentDn: string) => void;
  onCreateGroupInOU?: (parentDn: string) => void;
  onCreateSubOU?: (parentDn: string) => void;
  onSelectUserByDn?: (dn: string) => void;
}

export const ObjectDetailPane: React.FC<ObjectDetailPaneProps> = ({
  selectedNode,
  onClose,
  allGroups = [],
  allUsers = [],
  onEditUser,
  onDeleteUser,
  onDisableUser,
  onMoveObject,
  onResetPassword,
  onAddMemberToGroup,
  onRemoveMemberFromGroup,
  onCreateUserInOU,
  onCreateGroupInOU,
  onCreateSubOU,
  onSelectUserByDn,
}) => {
  const { isGlobalAdmin } = useAuth();
  const { info } = useToast();
  const [copiedDn, setCopiedDn] = useState(false);

  // Allow closing card via Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!selectedNode) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white border border-slate-200/80 rounded-2xl">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-3 mb-4">
          <img
            src="/assets/aistudio/LARK_Mascot_ac195d74.png"
            alt="LARK Mascot"
            className="w-full h-full object-contain opacity-60"
          />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">No Object Selected</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
          Select an Organizational Unit, User account, or Group from the directory tree to inspect attributes and permissions.
        </p>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDn(true);
    info('Copied to clipboard', text);
    setTimeout(() => setCopiedDn(false), 2000);
  };

  // Reusable Top Exit Bar
  const renderTopExitBar = (objectLabel: string) => (
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
        <span className="text-xs text-slate-400 font-mono">{objectLabel}</span>
      )}

      {onClose && (
        <button
          onClick={onClose}
          className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition"
          title="Close card (Esc)"
          aria-label="Close"
        >
          <span>Close</span>
          <X className="w-3.5 h-3.5 ml-0.5" />
        </button>
      )}
    </div>
  );

  // 1. Root Directory View
  if (selectedNode.type === 'root') {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 h-full overflow-y-auto">
        {renderTopExitBar('Root Base')}

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
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl font-mono text-xs text-slate-800">
              <span className="truncate">{selectedNode.baseDn}</span>
              <button
                onClick={() => copyToClipboard(selectedNode.baseDn)}
                className="text-slate-400 hover:text-slate-700 ml-2"
                title="Copy Base DN"
              >
                {copiedDn ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isGlobalAdmin && (
            <div className="pt-4 border-t border-slate-100">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Root Operations
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onCreateSubOU?.(selectedNode.baseDn)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Create Root OU</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. User Inspector
  if (selectedNode.type === 'user') {
    const user = selectedNode.data;
    const userDn = user.dn || `uid=${user.uid},dc=neuropunk`;

    // Find groups this user belongs to
    const memberOf = allGroups.filter((g) => g.members?.includes(userDn) || g.members?.some(m => m.includes(`uid=${user.uid}`)));

    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 h-full overflow-y-auto">
        {renderTopExitBar(`User: ${user.uid}`)}

        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-base">
              {user.given_name?.[0] || user.cn?.[0] || user.uid[0]?.toUpperCase()}
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

          {isGlobalAdmin && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onEditUser?.(user)}
                title="Edit User Attributes"
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition text-xs font-medium flex items-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={() => onMoveObject?.(userDn, user.cn)}
                title="Move User to another OU"
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition text-xs font-medium flex items-center gap-1"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Move</span>
              </button>
            </div>
          )}
        </div>

        {/* Distinguished Name Bar */}
        <div className="mt-5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Distinguished Name (DN)
          </label>
          <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-mono text-[11px] text-slate-800 break-all">
            <span className="select-all">{userDn}</span>
            <button
              onClick={() => copyToClipboard(userDn)}
              className="text-slate-400 hover:text-slate-700 ml-2 shrink-0 p-1 rounded"
              title="Copy DN"
            >
              {copiedDn ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Attribute Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              User ID (uid)
            </span>
            <p className="text-xs font-mono font-medium text-slate-800 mt-1">{user.uid}</p>
          </div>

          <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email (mail)
            </span>
            <a href={`mailto:${user.mail}`} className="text-xs font-medium text-indigo-600 hover:underline mt-1 block truncate">
              {user.mail}
            </a>
          </div>

          <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              Department
            </span>
            <p className="text-xs font-medium text-slate-800 mt-1">{user.department || 'Not specified'}</p>
          </div>

          <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              Title / Role
            </span>
            <p className="text-xs font-medium text-slate-800 mt-1">{user.title || 'Not specified'}</p>
          </div>

          <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400">Given Name (givenName)</span>
            <p className="text-xs font-medium text-slate-800 mt-1">{user.given_name}</p>
          </div>

          <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400">Surname (sn)</span>
            <p className="text-xs font-medium text-slate-800 mt-1">{user.sn}</p>
          </div>
        </div>

        {/* Group Memberships */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Group Memberships ({memberOf.length})
            </label>
          </div>
          {memberOf.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No assigned groups</p>
          ) : (
            <div className="space-y-1.5">
              {memberOf.map((grp) => (
                <div
                  key={grp.dn}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{grp.cn}</span>
                    {grp.description && (
                      <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                        · {grp.description}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">Group</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Object Classes */}
        {user.object_classes && user.object_classes.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              LDAP Object Classes
            </label>
            <div className="flex flex-wrap gap-1.5">
              {user.object_classes.map((oc) => (
                <span
                  key={oc}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200/60"
                >
                  {oc}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Admin Operations */}
        {isGlobalAdmin && (
          <div className="mt-8 pt-5 border-t border-slate-100">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              Administrative Operations
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onResetPassword?.(user)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset Password</span>
              </button>
              <button
                onClick={() => onDisableUser?.(user)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/70 rounded-lg text-xs font-medium transition"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Disable Account</span>
              </button>
              <button
                onClick={() => onDeleteUser?.(user)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/70 rounded-lg text-xs font-medium transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete User</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. Group Inspector
  if (selectedNode.type === 'group') {
    const group = selectedNode.data;
    const members = group.members || [];

    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 h-full overflow-y-auto">
        {renderTopExitBar(`Group: ${group.cn}`)}

        <div className="flex items-start justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{group.cn}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {group.description || 'LDAP Group of Names'}
              </p>
            </div>
          </div>

          {isGlobalAdmin && (
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
                title="Move Group to another OU"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Move</span>
              </button>
            </div>
          )}
        </div>

        {/* Distinguished Name Bar */}
        <div className="mt-5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Group DN
          </label>
          <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-mono text-[11px] text-slate-800 break-all">
            <span className="select-all">{group.dn}</span>
            <button
              onClick={() => copyToClipboard(group.dn)}
              className="text-slate-400 hover:text-slate-700 ml-2 shrink-0 p-1 rounded"
              title="Copy DN"
            >
              {copiedDn ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Members List */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Enrolled Members ({members.length})
            </label>
          </div>

          {members.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
              This group currently has no active members.
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((memberDn) => {
                const matchingUser = allUsers.find(
                  (u) => u.dn === memberDn || memberDn.includes(`uid=${u.uid},`) || memberDn === u.uid
                );

                return (
                  <div
                    key={memberDn}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100/60 transition group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 text-xs font-semibold shrink-0">
                        {matchingUser?.given_name?.[0] || 'U'}
                      </div>
                      <div className="min-w-0">
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
                        <p className="font-mono text-[10px] text-slate-500 truncate">{memberDn}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 ml-2">
                      {matchingUser && (
                        <button
                          onClick={() => onSelectUserByDn?.(memberDn)}
                          title="View user details"
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isGlobalAdmin && (
                        <button
                          onClick={() => onRemoveMemberFromGroup?.(group.dn, memberDn)}
                          title="Remove user from group"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Object Classes */}
        {group.object_classes && group.object_classes.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Object Classes
            </label>
            <div className="flex flex-wrap gap-1.5">
              {group.object_classes.map((oc) => (
                <span
                  key={oc}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200/60"
                >
                  {oc}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. Organizational Unit (OU) Inspector
  if (selectedNode.type === 'ou') {
    const ou = selectedNode.data as LDAPTreeOU;
    const usersCount = ou.users?.length ?? 0;
    const groupsCount = ou.groups?.length ?? 0;
    const subOusCount = ou.children_ous?.length ?? 0;

    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 h-full overflow-y-auto">
        {renderTopExitBar(`OU: ${ou.ou}`)}

        <div className="flex items-start justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 font-bold">
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{ou.ou}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {ou.description || 'Organizational Unit (OU)'}
              </p>
            </div>
          </div>

          {isGlobalAdmin && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onMoveObject?.(ou.dn, ou.ou)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition text-xs font-medium flex items-center gap-1"
                title="Move OU"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Move OU</span>
              </button>
            </div>
          )}
        </div>

        {/* Distinguished Name */}
        <div className="mt-5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            OU Distinguished Name
          </label>
          <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-mono text-[11px] text-slate-800 break-all">
            <span className="select-all">{ou.dn}</span>
            <button
              onClick={() => copyToClipboard(ou.dn)}
              className="text-slate-400 hover:text-slate-700 ml-2 shrink-0 p-1 rounded"
              title="Copy DN"
            >
              {copiedDn ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 block">Direct Users</span>
            <span className="text-lg font-bold text-slate-900">{usersCount}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 block">Groups</span>
            <span className="text-lg font-bold text-slate-900">{groupsCount}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 block">Sub-OUs</span>
            <span className="text-lg font-bold text-slate-900">{subOusCount}</span>
          </div>
        </div>

        {/* Fast Action Buttons to Create Inside this OU */}
        {isGlobalAdmin && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              Add Objects to {ou.ou}
            </label>
            <div className="flex flex-wrap gap-2">
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
          </div>
        )}
      </div>
    );
  }

  return null;
};
