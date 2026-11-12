import React from 'react';
import { FolderTree, Users, Shield, Layers, Database, LogOut, Server, Lock, RefreshCw } from 'lucide-react';
import logo from '../assets/logo.png';
import { canReadEveryObject } from '../utils/role';

export default function Header({ activeTab, onTabChange, profile, baseDn, onRefresh, refreshing, onLogout }) {
  const role = profile?.role || 'USER';
  const hasFullRead = canReadEveryObject(role);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
              <img src={logo} alt="LARK Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-slate-900 text-base">LARK</span>
                <span className="text-[10px] uppercase font-mono tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  LDAP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                LDAP Administration & Resource Kit
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 ml-6 pl-6 border-l border-slate-200 text-xs text-slate-500">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono text-slate-700 font-medium">{baseDn || 'dc=neuropunk'}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Connected
              </span>
            </div>
          </div>

          {/* User info & Actions */}
          <div className="flex items-center gap-3">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={refreshing}
                title="Refresh directory"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">Sync</span>
              </button>
            )}

            {profile && (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-xs font-semibold text-slate-900">{profile.name || profile.username}</span>
                    <span className="font-mono text-[10px] text-slate-500">({profile.username})</span>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[11px]">
                    <span
                      className={`font-semibold ${
                        role === 'GLOBAL_ADMIN'
                          ? 'text-indigo-600'
                          : role === 'GLOBAL_READER'
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {role}
                    </span>
                    {profile.department && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500 hidden lg:inline">{profile.department}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 -mb-px overflow-x-auto border-t border-slate-100 pt-1">
          <button
            onClick={() => onTabChange('tree')}
            className={`flex items-center gap-2 py-2.5 px-3.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'tree'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Directory Tree</span>
          </button>

          <button
            onClick={() => hasFullRead && onTabChange('users')}
            disabled={!hasFullRead}
            title={!hasFullRead ? 'DEMO_USERS can inspect users inside the Directory Tree' : undefined}
            className={`flex items-center gap-2 py-2.5 px-3.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : !hasFullRead
                ? 'border-transparent text-slate-300 cursor-not-allowed'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users</span>
            {!hasFullRead && <Lock className="w-3 h-3 text-slate-300" />}
          </button>

          <button
            onClick={() => hasFullRead && onTabChange('groups')}
            disabled={!hasFullRead}
            title={!hasFullRead ? 'DEMO_USERS can inspect groups inside the Directory Tree' : undefined}
            className={`flex items-center gap-2 py-2.5 px-3.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'groups'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : !hasFullRead
                ? 'border-transparent text-slate-300 cursor-not-allowed'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Groups</span>
            {!hasFullRead && <Lock className="w-3 h-3 text-slate-300" />}
          </button>

          <button
            onClick={() => hasFullRead && onTabChange('ous')}
            disabled={!hasFullRead}
            title={!hasFullRead ? 'DEMO_USERS can inspect OUs inside the Directory Tree' : undefined}
            className={`flex items-center gap-2 py-2.5 px-3.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'ous'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : !hasFullRead
                ? 'border-transparent text-slate-300 cursor-not-allowed'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Organizational Units</span>
            {!hasFullRead && <Lock className="w-3 h-3 text-slate-300" />}
          </button>

          <button
            onClick={() => onTabChange('snapshot')}
            className={`flex items-center gap-2 py-2.5 px-3.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'snapshot'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Snapshot</span>
          </button>
        </div>
      </div>
    </header>
  );
}
