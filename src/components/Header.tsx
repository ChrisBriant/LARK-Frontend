import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FolderTree,
  Users,
  Shield,
  Layers,
  Database,
  LogOut,
  Server,
  Lock,
} from 'lucide-react';

export type ActiveTab = 'tree' | 'users' | 'groups' | 'ous' | 'snapshot';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  baseDn?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  baseDn = 'dc=neuropunk',
  onRefresh,
  refreshing = false,
}) => {
  const { user, role, isGlobalAdmin, isGlobalReader, isDemoUser, logout } = useAuth();

  const canAccessFlatResources = isGlobalAdmin || isGlobalReader;

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
      {/* Top Banner with App Brand, LDAP Server Status, User Profile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/70 p-1 flex items-center justify-center shrink-0">
              <img
                src="/assets/aistudio/LARK_Mascot_ac195d74.png"
                alt="LARK Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-slate-900 text-base">LARK</span>
                <span className="text-[10px] uppercase font-mono tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                LDAP Administration & Resource Kit
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 ml-6 pl-6 border-l border-slate-200 text-xs text-slate-500">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono text-slate-700 font-medium">{baseDn}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
          </div>

          {/* Right: User Information & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={refreshing}
                title="Reload directory data"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg border border-slate-200/80 transition text-xs font-medium flex items-center gap-1.5"
              >
                <div className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 21h5v-5" />
                  </svg>
                </div>
                <span className="hidden md:inline">Sync</span>
              </button>
            )}

            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-xs font-semibold text-slate-900">{user.name || user.username}</span>
                    <span className="font-mono text-[10px] text-slate-600">({user.username})</span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 text-[11px]">
                    <span className={`font-semibold ${
                      isGlobalAdmin
                        ? 'text-indigo-600'
                        : isGlobalReader
                        ? 'text-emerald-600'
                        : isDemoUser
                        ? 'text-amber-600'
                        : 'text-slate-500'
                    }`}>
                      {role}
                    </span>
                    {user.department && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-slate-600 hidden lg:inline">{user.department}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Clean Minimalist Tab Bar */}
        <div className="flex items-center gap-1 -mb-px overflow-x-auto no-scrollbar border-t border-slate-100 pt-1">
          <button
            onClick={() => onTabChange('tree')}
            className={`flex items-center gap-2 py-2.5 px-3.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'tree'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Directory Tree</span>
          </button>

          <button
            onClick={() => canAccessFlatResources && onTabChange('users')}
            disabled={!canAccessFlatResources}
            title={!canAccessFlatResources ? 'DEMO_USERS can inspect users within the Directory Tree' : undefined}
            className={`flex items-center gap-2 py-2.5 px-3.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : !canAccessFlatResources
                ? 'border-transparent text-slate-300 cursor-not-allowed'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users</span>
            {!canAccessFlatResources && <Lock className="w-3 h-3 text-slate-300" />}
          </button>

          <button
            onClick={() => canAccessFlatResources && onTabChange('groups')}
            disabled={!canAccessFlatResources}
            title={!canAccessFlatResources ? 'DEMO_USERS can inspect groups within the Directory Tree' : undefined}
            className={`flex items-center gap-2 py-2.5 px-3.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'groups'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : !canAccessFlatResources
                ? 'border-transparent text-slate-300 cursor-not-allowed'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Groups</span>
            {!canAccessFlatResources && <Lock className="w-3 h-3 text-slate-300" />}
          </button>

          <button
            onClick={() => canAccessFlatResources && onTabChange('ous')}
            disabled={!canAccessFlatResources}
            title={!canAccessFlatResources ? 'DEMO_USERS can inspect OUs within the Directory Tree' : undefined}
            className={`flex items-center gap-2 py-2.5 px-3.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'ous'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : !canAccessFlatResources
                ? 'border-transparent text-slate-300 cursor-not-allowed'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Organizational Units</span>
            {!canAccessFlatResources && <Lock className="w-3 h-3 text-slate-300" />}
          </button>

          <button
            onClick={() => onTabChange('snapshot')}
            className={`flex items-center gap-2 py-2.5 px-3.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'snapshot'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Snapshot Inventory</span>
          </button>
        </div>
      </div>
    </header>
  );
};
