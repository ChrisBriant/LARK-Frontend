import React, { useState, useMemo } from 'react';
import { LDAPUser, LDAPGroup } from '../../types/ldap';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  ShieldAlert,
  KeyRound,
  ArrowRightLeft,
  Mail,
  Building,
  UserCheck,
} from 'lucide-react';

interface UsersViewProps {
  users: LDAPUser[];
  allGroups?: LDAPGroup[];
  loading: boolean;
  onCreateUser: () => void;
  onEditUser: (user: LDAPUser) => void;
  onDeleteUser: (user: LDAPUser) => void;
  onDisableUser: (user: LDAPUser) => void;
  onResetPassword: (user: LDAPUser) => void;
  onMoveUser: (user: LDAPUser) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  allGroups = [],
  loading,
  onCreateUser,
  onEditUser,
  onDeleteUser,
  onDisableUser,
  onResetPassword,
  onMoveUser,
}) => {
  const { isGlobalAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  // Extract unique departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      if (u.department) set.add(u.department);
    });
    return Array.from(set).sort();
  }, [users]);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (selectedDept !== 'all' && u.department !== selectedDept) {
        return false;
      }
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        u.cn.toLowerCase().includes(q) ||
        u.uid.toLowerCase().includes(q) ||
        u.mail.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q)) ||
        (u.title && u.title.toLowerCase().includes(q))
      );
    });
  }, [users, search, selectedDept]);

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name, uid, email, title..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
            />
          </div>

          {/* Department Filter Selector */}
          <div className="w-full sm:w-48">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-slate-700 focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">All Departments ({users.length})</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs text-slate-500 font-medium">
            {filteredUsers.length} users
          </span>

          {isGlobalAdmin && (
            <button
              onClick={onCreateUser}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create User</span>
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">User / CN</th>
                <th className="py-3 px-4">UID</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Department & Title</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  return (
                    <tr
                      key={user.uid}
                      className="hover:bg-slate-50/70 transition group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                            {user.given_name?.[0] || user.cn?.[0] || 'U'}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{user.cn}</span>
                            <span className="text-[11px] text-slate-400">{user.given_name} {user.sn}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                        {user.uid}
                      </td>

                      <td className="py-3 px-4">
                        <a
                          href={`mailto:${user.mail}`}
                          className="text-slate-600 hover:text-indigo-600 transition flex items-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{user.mail}</span>
                        </a>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <div>
                          <span className="font-medium text-slate-800">{user.department || '—'}</span>
                          {user.title && (
                            <span className="text-[11px] text-slate-500 block">{user.title}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isGlobalAdmin ? (
                          <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100">
                            <button
                              onClick={() => onEditUser(user)}
                              title="Edit User"
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onMoveUser(user)}
                              title="Move User to another OU"
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onResetPassword(user)}
                              title="Reset Password"
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDisableUser(user)}
                              title="Disable Account"
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteUser(user)}
                              title="Delete User"
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Read-Only</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
