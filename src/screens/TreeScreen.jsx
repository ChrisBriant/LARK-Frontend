import React, { useState } from 'react';
import { Search, FolderTree, ChevronsDown, ChevronsUp, Server, ArrowLeft, X } from 'lucide-react';
import TreeNode from '../components/TreeNode';
import ObjectInspector from '../components/ObjectInspector';

export default function TreeScreen({
  tree,
  loading,
  selectedNode,
  onSelectNode,
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
}) {
  const [searchFilter, setSearchFilter] = useState('');
  const [forceExpandAll, setForceExpandAll] = useState(undefined);

  const rootOus = tree?.root_ous || [];
  const baseDn = tree?.base_dn || 'dc=neuropunk';

  const getSelectedLabel = () => {
    if (!selectedNode) return '';
    if (selectedNode.type === 'user') return `${selectedNode.data?.cn} (@${selectedNode.data?.uid})`;
    if (selectedNode.type === 'group') return `Group: ${selectedNode.data?.cn}`;
    if (selectedNode.type === 'ou') return `OU: ${selectedNode.data?.ou}`;
    if (selectedNode.type === 'root') return `Root: ${selectedNode.baseDn}`;
    return '';
  };

  const handleSelectUserByDn = (dn) => {
    const matched = allUsers.find((u) => u.dn === dn || dn.includes(`uid=${u.uid},`) || dn === u.uid);
    if (matched) {
      onSelectNode({ type: 'user', data: matched });
    }
  };

  return (
    <div className="space-y-4">
      {/* Mobile return bar */}
      {selectedNode && (
        <div className="lg:hidden flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="truncate pr-2">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Selected</span>
            <span className="text-xs font-semibold text-slate-900 truncate block">{getSelectedLabel()}</span>
          </div>
          <button
            onClick={() => onSelectNode(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Tree</span>
          </button>
        </div>
      )}

      {/* Main Dual-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-175px)] min-h-[580px]">
        {/* Left Tree Pane */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl flex flex-col h-full shadow-xs overflow-hidden">
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
                  title="Expand All"
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded"
                >
                  <ChevronsDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setForceExpandAll(false)}
                  title="Collapse All"
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded"
                >
                  <ChevronsUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter tree by name, uid, OU..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
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

            {selectedNode && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-xs">
                <div className="flex items-center gap-1.5 min-w-0 pr-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                  <span className="text-slate-700 text-[11px] truncate">
                    Selected: <strong>{getSelectedLabel()}</strong>
                  </span>
                </div>
                <button
                  onClick={() => onSelectNode(null)}
                  className="text-[11px] text-indigo-700 hover:text-indigo-900 px-2 py-0.5 rounded font-semibold flex items-center gap-1 shrink-0"
                  title="Deselect object and close card"
                >
                  <span>Deselect</span>
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Tree Scrollable */}
          <div className="flex-1 p-3 overflow-y-auto space-y-1">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
                <span className="text-xs">Loading tree...</span>
              </div>
            ) : rootOus.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">No organizational units found.</div>
            ) : (
              <>
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

                <div className="space-y-0.5 mt-1 border-l border-slate-200 ml-4 pl-1">
                  {rootOus.map((ou) => (
                    <TreeNode
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

          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>{rootOus.length} root OUs</span>
            <span>{allUsers.length} users · {allGroups.length} groups</span>
          </div>
        </div>

        {/* Right Inspector Pane */}
        <div className="lg:col-span-7 h-full">
          <ObjectInspector
            selectedNode={selectedNode}
            onClose={() => onSelectNode(null)}
            allGroups={allGroups}
            allUsers={allUsers}
            profile={profile}
            onEditUser={onEditUser}
            onDeleteUser={onDeleteUser}
            onDisableUser={onDisableUser}
            onMoveObject={onMoveObject}
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
}
