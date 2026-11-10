import React, { useState, useEffect } from 'react';
import {
  LDAPTreeOU,
  LDAPUser,
  LDAPGroup,
  SelectedNode,
} from '../../types/ldap';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  User,
  Users,
} from 'lucide-react';

interface TreeNodeItemProps {
  ou: LDAPTreeOU;
  level?: number;
  selectedNode: SelectedNode | null;
  onSelectNode: (node: SelectedNode | null) => void;
  searchFilter: string;
  forceExpandAll?: boolean;
}

export const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  ou,
  level = 0,
  selectedNode,
  onSelectNode,
  searchFilter,
  forceExpandAll,
}) => {
  const [expanded, setExpanded] = useState<boolean>(true);

  useEffect(() => {
    if (forceExpandAll !== undefined) {
      setExpanded(forceExpandAll);
    }
  }, [forceExpandAll]);

  // If searchFilter is present, automatically expand if children match
  useEffect(() => {
    if (searchFilter) {
      setExpanded(true);
    }
  }, [searchFilter]);

  const matchesSearch = (text?: string | null) => {
    if (!searchFilter) return true;
    if (!text) return false;
    return text.toLowerCase().includes(searchFilter.toLowerCase());
  };

  const users = ou.users || [];
  const groups = ou.groups || [];
  const childrenOus = ou.children_ous || [];

  const filteredUsers = users.filter(
    (u) =>
      matchesSearch(u.cn) ||
      matchesSearch(u.uid) ||
      matchesSearch(u.mail) ||
      matchesSearch(u.department) ||
      matchesSearch(u.dn)
  );

  const filteredGroups = groups.filter(
    (g) => matchesSearch(g.cn) || matchesSearch(g.description) || matchesSearch(g.dn)
  );

  const filteredChildOus = childrenOus.filter(
    (child) =>
      matchesSearch(child.ou) ||
      matchesSearch(child.description) ||
      matchesSearch(child.dn) ||
      (child.users && child.users.some((u) => matchesSearch(u.cn) || matchesSearch(u.uid))) ||
      (child.groups && child.groups.some((g) => matchesSearch(g.cn)))
  );

  const ouSelfMatches = matchesSearch(ou.ou) || matchesSearch(ou.description) || matchesSearch(ou.dn);
  const hasMatchingDescendant = filteredUsers.length > 0 || filteredGroups.length > 0 || filteredChildOus.length > 0;

  if (searchFilter && !ouSelfMatches && !hasMatchingDescendant) {
    return null;
  }

  const isOuSelected =
    selectedNode?.type === 'ou' && (selectedNode.data as LDAPTreeOU).dn === ou.dn;

  const totalDirectItems = users.length + groups.length + childrenOus.length;

  return (
    <div className="select-none text-xs">
      {/* OU Row */}
      <div
        className={`group flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition ${
          isOuSelected
            ? 'bg-slate-900 text-white font-medium'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
        style={{ paddingLeft: `${Math.max(8, level * 16 + 8)}px` }}
        onClick={() => {
          if (isOuSelected) {
            onSelectNode(null);
          } else {
            onSelectNode({ type: 'ou', data: ou });
          }
        }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {totalDirectItems > 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="p-0.5 -ml-1 text-slate-400 group-hover:text-slate-600 hover:bg-black/5 rounded"
            >
              {expanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <span className="w-3.5 h-3.5 -ml-1 inline-block" />
          )}

          {expanded ? (
            <FolderOpen
              className={`w-4 h-4 shrink-0 ${
                isOuSelected ? 'text-amber-300' : 'text-amber-500'
              }`}
            />
          ) : (
            <Folder
              className={`w-4 h-4 shrink-0 ${
                isOuSelected ? 'text-amber-300' : 'text-amber-500'
              }`}
            />
          )}

          <span className="truncate">{ou.ou}</span>
        </div>

        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          <span
            className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
              isOuSelected ? 'text-slate-300 bg-white/10' : 'text-slate-400 bg-slate-100'
            }`}
          >
            {users.length}u · {groups.length}g
          </span>
        </div>
      </div>

      {/* Children list */}
      {expanded && (
        <div className="space-y-0.5 mt-0.5">
          {/* Sub-OUs */}
          {filteredChildOus.map((child) => (
            <TreeNodeItem
              key={child.dn}
              ou={child}
              level={level + 1}
              selectedNode={selectedNode}
              onSelectNode={onSelectNode}
              searchFilter={searchFilter}
              forceExpandAll={forceExpandAll}
            />
          ))}

          {/* Groups in this OU */}
          {filteredGroups.map((group) => {
            const isGroupSelected =
              selectedNode?.type === 'group' && selectedNode.data.dn === group.dn;

            return (
              <div
                key={group.dn}
                className={`group flex items-center justify-between py-1 px-2 rounded-lg cursor-pointer transition ${
                  isGroupSelected
                    ? 'bg-slate-900 text-white font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                style={{ paddingLeft: `${(level + 1) * 16 + 18}px` }}
                onClick={() => {
                  if (isGroupSelected) {
                    onSelectNode(null);
                  } else {
                    onSelectNode({ type: 'group', data: group });
                  }
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Users
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isGroupSelected ? 'text-emerald-300' : 'text-emerald-600'
                    }`}
                  />
                  <span className="truncate">{group.cn}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-1 rounded ${
                    isGroupSelected ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {group.members?.length || 0}
                </span>
              </div>
            );
          })}

          {/* Users in this OU */}
          {filteredUsers.map((user) => {
            const isUserSelected =
              selectedNode?.type === 'user' && selectedNode.data.uid === user.uid;

            return (
              <div
                key={user.uid}
                className={`group flex items-center justify-between py-1 px-2 rounded-lg cursor-pointer transition ${
                  isUserSelected
                    ? 'bg-slate-900 text-white font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                style={{ paddingLeft: `${(level + 1) * 16 + 18}px` }}
                onClick={() => {
                  if (isUserSelected) {
                    onSelectNode(null);
                  } else {
                    onSelectNode({ type: 'user', data: user });
                  }
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <User
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isUserSelected ? 'text-indigo-300' : 'text-indigo-600'
                    }`}
                  />
                  <span className="truncate">{user.cn}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-1 rounded truncate max-w-[90px] ${
                    isUserSelected ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {user.uid}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
