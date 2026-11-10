import React, { useState } from 'react';
import {
  LDAPDirectoryTree,
  SelectedNode,
  LDAPUser,
  LDAPGroup,
  LDAPTreeOU,
} from '../../types/ldap';
import { TreeNodeItem } from './TreeNodeItem';
import { ObjectDetailPane } from './ObjectDetailPane';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  FolderTree,
  ChevronsDown,
  ChevronsUp,
  Server,
  ArrowLeft,
  X,
} from 'lucide-react';

interface DirectoryTreeViewProps {
  tree: LDAPDirectoryTree | null;
  loading: boolean;
  selectedNode: SelectedNode | null;
  onSelectNode: (node: SelectedNode | null) => void;
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
}

export const DirectoryTreeView: React.FC<DirectoryTreeViewProps> = ({
  tree,
  loading,
  selectedNode,
  onSelectNode,
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
}) => {
  const { isDemoUser } = useAuth();
  const [searchFilter, setSearchFilter] = useState('');
  const [forceExpandAll, setForceExpandAll] = useState<boolean | undefined>(undefined);

  const rootOus = tree?.root_ous || [];
  const baseDn = tree?.base_dn || 'dc=neuropunk';

  // Helper to jump to a user when clicked inside group members
  const handleSelectUserByDn = (dn: string) => {
    const user = allUsers.find(
      (u) => u.dn === dn || dn.includes(`uid=${u.uid},`) || dn === u.uid
    );
    if (user) {
      onSelectNode({ type: 'user', data: user });
    }
  };

  const getSelectedNodeLabel = () => {
    if (!selectedNode) return '';
    if (selectedNode.type === 'user') return `${selectedNode.data.cn} (@${selectedNode.data.uid})`;
    if (selectedNode.type === 'group') return `Group: ${selectedNode.data.cn}`;
    if (selectedNode.type === 'ou') return `OU: ${(selectedNode.data as LDAPTreeOU).ou}`;
    if (selectedNode.type === 'root') return `Root: ${selectedNode.baseDn}`;
    return '';
  };

  return (
    <div className="space-y-4">
      {/* Informative notice for DEMO_USERS */}
      {isDemoUser && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3">
          <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
            i
          </div>
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-semibold">Demo User Tree Access: </span>
            You are browsing the directory as <span className="font-mono font-medium">duser</span>. You have full read access to explore the complete DIT hierarchy, organizational units, users, and groups.
          </div>
        </div>
      )}

      {/* Mobile/Narrow Screen Top Return Bar */}
      {selectedNode && (
        <div className="lg:hidden flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="truncate pr-2">
            <span className="text-[11px] text-slate-400 block uppercase font-semibold">Active Selection</span>
            <span className="text-xs font-semibold text-slate-900 truncate block">
              {getSelectedNodeLabel()}
            </span>
          </div>
          <button
            onClick={() => onSelectNode(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium shrink-0 transition shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Tree</span>
          </button>
        </div>
      )}

      {/* Main Dual-Pane Directory Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-175px)] min-h-[600px]">
        {/* Left Pane: Tree Navigation (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl flex flex-col h-full shadow-sm overflow-hidden">
          {/* Tree Pane Header & Filter Controls */}
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-slate-700" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Directory Information Tree
                </h2>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setForceExpandAll(true)}
                  title="Expand All Folders"
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition"
                >
                  <ChevronsDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setForceExpandAll(false)}
                  title="Collapse All Folders"
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition"
                >
                  <ChevronsUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Fast search filter input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter tree by name, uid, OU..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Prominent Active Selection Badge with Exit / Deselect button in Tree Header */}
            {selectedNode && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-50/70 border border-indigo-100/80 text-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 min-w-0 pr-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                  <span className="text-slate-600 text-[11px] truncate">
                    Selected: <strong className="text-slate-900 font-semibold">{getSelectedNodeLabel()}</strong>
                  </span>
                </div>
                <button
                  onClick={() => onSelectNode(null)}
                  className="text-[11px] text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100/80 px-2 py-0.5 rounded font-semibold flex items-center gap-1 shrink-0 transition"
                  title="Deselect object and close card (Esc)"
                >
                  <span>Deselect</span>
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Tree Scrollable Body */}
          <div className="flex-1 p-3 overflow-y-auto space-y-1">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
                <span className="text-xs">Loading directory hierarchy...</span>
              </div>
            ) : rootOus.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No organizational units found.
              </div>
            ) : (
              <>
                {/* Root Base DN Item */}
                <div
                  onClick={() => {
                    if (selectedNode?.type === 'root') {
                      onSelectNode(null);
                    } else {
                      onSelectNode({ type: 'root', baseDn });
                    }
                  }}
                  className={`group flex items-center justify-between py-1.5 px-2.5 rounded-lg cursor-pointer transition text-xs ${
                    selectedNode?.type === 'root'
                      ? 'bg-slate-900 text-white font-medium'
                      : 'text-slate-800 hover:bg-slate-100 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Server className={`w-4 h-4 ${selectedNode?.type === 'root' ? 'text-blue-300' : 'text-blue-600'}`} />
                    <span className="font-mono text-xs">{baseDn}</span>
                  </div>
                  <span className={`text-[10px] font-mono ${selectedNode?.type === 'root' ? 'text-slate-300' : 'text-slate-400'}`}>
                    root
                  </span>
                </div>

                {/* Root OUs list */}
                <div className="space-y-0.5 mt-1 border-l border-slate-200 ml-4 pl-1">
                  {rootOus.map((ou) => (
                    <TreeNodeItem
                      key={ou.dn}
                      ou={ou}
                      level={0}
                      selectedNode={selectedNode}
                      onSelectNode={onSelectNode}
                      searchFilter={searchFilter}
                      forceExpandAll={forceExpandAll}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Tree Footer with Counts */}
          <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-mono">{rootOus.length} root OUs</span>
            <div className="flex items-center gap-3">
              <span>{allUsers.length} users</span>
              <span aria-hidden="true">·</span>
              <span>{allGroups.length} groups</span>
            </div>
          </div>
        </div>

        {/* Right Pane: Object Inspector (7 cols on lg) */}
        <div className="lg:col-span-7 h-full">
          <ObjectDetailPane
            selectedNode={selectedNode}
            onClose={() => onSelectNode(null)}
            allGroups={allGroups}
            allUsers={allUsers}
            onEditUser={onEditUser}
            onDeleteUser={onDeleteUser}
            onDisableUser={onDisableUser}
            onMoveObject={onMoveObject}
            onResetPassword={onResetPassword}
            onAddMemberToGroup={onAddMemberToGroup}
            onRemoveMemberFromGroup={onRemoveMemberFromGroup}
            onCreateUserInOU={onCreateUserInOU}
            onCreateGroupInOU={onCreateGroupInOU}
            onCreateSubOU={onCreateSubOU}
            onSelectUserByDn={handleSelectUserByDn}
          />
        </div>
      </div>
    </div>
  );
};
