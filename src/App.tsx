import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Header, ActiveTab } from './components/Header';
import { LoginView } from './components/LoginView';
import { DirectoryTreeView } from './components/DirectoryTree/DirectoryTreeView';
import { UsersView } from './components/Users/UsersView';
import { GroupsView } from './components/Groups/GroupsView';
import { OUsView } from './components/OUs/OUsView';
import { SnapshotView } from './components/Snapshot/SnapshotView';

// Modals
import { UserModal } from './components/Users/UserModal';
import { DeleteUserModal } from './components/Users/DeleteUserModal';
import { DisableUserModal } from './components/Users/DisableUserModal';
import { ResetPasswordModal } from './components/Users/ResetPasswordModal';
import { GroupModal } from './components/Groups/GroupModal';
import { ManageMembersModal } from './components/Groups/ManageMembersModal';
import { OUModal } from './components/OUs/OUModal';
import { MoveObjectModal } from './components/MoveObjectModal';

import {
  LDAPDirectoryTree,
  LDAPDirectorySnapshot,
  LDAPUser,
  LDAPGroup,
  LDAPOU,
  SelectedNode,
  LDAPUserCreate,
  LDAPUserUpdate,
  LDAPGroupCreate,
  LDAPOUCreate,
} from './types/ldap';
import { api } from './services/api';

const MainApp: React.FC = () => {
  const { user, loading: authLoading, isGlobalAdmin, isGlobalReader, isDemoUser } = useAuth();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('tree');
  const [directoryTree, setDirectoryTree] = useState<LDAPDirectoryTree | null>(null);
  const [snapshot, setSnapshot] = useState<LDAPDirectorySnapshot | null>(null);
  const [users, setUsers] = useState<LDAPUser[]>([]);
  const [groups, setGroups] = useState<LDAPGroup[]>([]);
  const [ous, setOus] = useState<LDAPOU[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);

  // Modal states
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<LDAPUser | null>(null);
  const [userDefaultParentDn, setUserDefaultParentDn] = useState<string>('ou=People,dc=neuropunk');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<LDAPUser | null>(null);

  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [userToDisable, setUserToDisable] = useState<LDAPUser | null>(null);

  const [resetPwdModalOpen, setResetPwdModalOpen] = useState(false);
  const [userToResetPwd, setUserToResetPwd] = useState<LDAPUser | null>(null);

  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupDefaultParentDn, setGroupDefaultParentDn] = useState<string>('ou=Groups,dc=neuropunk');

  const [manageMembersModalOpen, setManageMembersModalOpen] = useState(false);
  const [groupToManageMembers, setGroupToManageMembers] = useState<LDAPGroup | null>(null);

  const [ouModalOpen, setOUModalOpen] = useState(false);
  const [ouDefaultParentDn, setOUDefaultParentDn] = useState<string>('dc=neuropunk');

  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [objectToMove, setObjectToMove] = useState<{ dn: string; name: string } | null>(null);

  // Load directory data
  const loadDirectoryData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);

    try {
      // 1. All roles (including DEMO_USERS) can load tree and snapshot
      const [treeData, snapshotData] = await Promise.all([
        api.getTree().catch((err) => {
          console.error('Failed to load tree:', err);
          return null;
        }),
        api.getSnapshot().catch((err) => {
          console.error('Failed to load snapshot:', err);
          return null;
        }),
      ]);

      if (treeData) setDirectoryTree(treeData);
      if (snapshotData) setSnapshot(snapshotData);

      // 2. Load dedicated resources if role is GLOBAL_ADMIN or GLOBAL_READER
      if (isGlobalAdmin || isGlobalReader) {
        const [usersData, groupsData, ousData] = await Promise.all([
          api.getUsers().catch(() => snapshotData?.users || []),
          api.getGroups().catch(() => snapshotData?.groups || []),
          api.getOUs().catch(() => snapshotData?.ous || []),
        ]);
        setUsers(usersData);
        setGroups(groupsData);
        setOus(ousData);
      } else {
        // DEMO_USERS role: extract from snapshot
        if (snapshotData) {
          setUsers(snapshotData.users || []);
          setGroups(snapshotData.groups || []);
          setOus(snapshotData.ous || []);
        }
      }
    } catch (err: any) {
      console.error('Error loading directory data:', err);
      error('Failed to sync directory', err.message);
    } finally {
      setDataLoading(false);
    }
  }, [user, isGlobalAdmin, isGlobalReader, error]);

  useEffect(() => {
    if (user) {
      loadDirectoryData();
    }
  }, [user, loadDirectoryData]);

  // Keep selected node updated if data reloads
  useEffect(() => {
    if (selectedNode?.type === 'group' && groups.length > 0) {
      const refreshedGroup = groups.find((g) => g.dn === selectedNode.data.dn);
      if (refreshedGroup) {
        setSelectedNode({ type: 'group', data: refreshedGroup });
      }
    }
  }, [groups, selectedNode]);

  // If user is DEMO_USERS and tries to switch to users/groups/ous tab, redirect to tree
  useEffect(() => {
    if (isDemoUser && ['users', 'groups', 'ous'].includes(activeTab)) {
      setActiveTab('tree');
    }
  }, [isDemoUser, activeTab]);

  // Handlers for User operations
  const handleOpenCreateUser = (parentDn?: string) => {
    setEditingUser(null);
    setUserDefaultParentDn(parentDn || 'ou=People,dc=neuropunk');
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (userToEdit: LDAPUser) => {
    setEditingUser(userToEdit);
    setUserModalOpen(true);
  };

  const handleSubmitUser = async (
    data: LDAPUserCreate | { uid: string; updates: LDAPUserUpdate }
  ) => {
    if ('updates' in data) {
      await api.updateUser(data.uid, data.updates);
      success('User attributes updated', `Successfully updated ${data.uid}`);
    } else {
      await api.createUser(data);
      success('User created', `Provisioned user ${data.uid} in directory`);
    }
    await loadDirectoryData();
  };

  const handleConfirmDeleteUser = async (uid: string) => {
    await api.deleteUser(uid);
    success('User deleted', `Removed user ${uid} from directory`);
    if (selectedNode?.type === 'user' && selectedNode.data.uid === uid) {
      setSelectedNode(null);
    }
    await loadDirectoryData();
  };

  const handleConfirmDisableUser = async (uid: string) => {
    const res = await api.disableUser(uid);
    success('Account disabled', res.message || `Disabled account for ${uid}`);
    await loadDirectoryData();
  };

  // Handlers for Group operations
  const handleOpenCreateGroup = (parentDn?: string) => {
    setGroupDefaultParentDn(parentDn || 'ou=Groups,dc=neuropunk');
    setGroupModalOpen(true);
  };

  const handleSubmitGroup = async (groupData: LDAPGroupCreate) => {
    await api.createGroup(groupData);
    success('Group created', `Created group ${groupData.cn}`);
    await loadDirectoryData();
  };

  const handleOpenManageMembers = (group: LDAPGroup) => {
    setGroupToManageMembers(group);
    setManageMembersModalOpen(true);
  };

  const handleAddMemberToGroup = async (groupDn: string, userDn: string) => {
    await api.addUserToGroup({ group_dn: groupDn, user_dn: userDn });
    success('Member added', `Added to ${groupDn.split(',')[0]}`);
    await loadDirectoryData();
    // Update active modal group
    setGroupToManageMembers((prev) =>
      prev
        ? {
            ...prev,
            members: [...(prev.members || []), userDn],
          }
        : null
    );
  };

  const handleRemoveMemberFromGroup = async (groupDn: string, userDn: string) => {
    await api.removeUserFromGroup({ group_dn: groupDn, user_dn: userDn });
    success('Member removed', `Removed from ${groupDn.split(',')[0]}`);
    await loadDirectoryData();
    // Update active modal group
    setGroupToManageMembers((prev) =>
      prev
        ? {
            ...prev,
            members: (prev.members || []).filter((m) => m !== userDn),
          }
        : null
    );
  };

  // Handlers for OU operations
  const handleOpenCreateOU = (parentDn?: string) => {
    setOUDefaultParentDn(parentDn || directoryTree?.base_dn || 'dc=neuropunk');
    setOUModalOpen(true);
  };

  const handleSubmitOU = async (ouData: LDAPOUCreate) => {
    await api.createOU(ouData);
    success('Organizational Unit created', `Created ou=${ouData.name}`);
    await loadDirectoryData();
  };

  // Handlers for Move operations
  const handleOpenMoveObject = (dn: string, name: string) => {
    setObjectToMove({ dn, name });
    setMoveModalOpen(true);
  };

  const handleConfirmMoveObject = async (currentDn: string, newParentDn: string) => {
    const res = await api.moveObject({ current_dn: currentDn, new_parent_dn: newParentDn });
    success('Object moved', res.message || `Moved object to ${newParentDn}`);
    await loadDirectoryData();
  };

  // Jump to user selection from elsewhere
  const handleSelectUserByDn = (dn: string) => {
    const matchedUser = users.find(
      (u) => u.dn === dn || dn.includes(`uid=${u.uid},`) || dn === u.uid
    );
    if (matchedUser) {
      setSelectedNode({ type: 'user', data: matchedUser });
      setActiveTab('tree');
    } else {
      info('User details', dn);
    }
  };

  // If loading session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 p-2.5 flex items-center justify-center mb-4 shadow-xs">
          <img
            src="/assets/aistudio/LARK_Mascot_ac195d74.png"
            alt="LARK Mascot"
            className="w-full h-full object-contain animate-pulse"
          />
        </div>
        <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-2" />
        <p className="text-xs text-slate-500 font-mono">Connecting to LARK...</p>
      </div>
    );
  }

  // If not signed in
  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* App Header & Tabs */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        baseDn={directoryTree?.base_dn || snapshot?.base_dn || 'dc=neuropunk'}
        onRefresh={loadDirectoryData}
        refreshing={dataLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'tree' && (
          <DirectoryTreeView
            tree={directoryTree}
            loading={dataLoading}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            allGroups={groups}
            allUsers={users}
            onEditUser={handleOpenEditUser}
            onDeleteUser={(u) => {
              setUserToDelete(u);
              setDeleteModalOpen(true);
            }}
            onDisableUser={(u) => {
              setUserToDisable(u);
              setDisableModalOpen(true);
            }}
            onResetPassword={(u) => {
              setUserToResetPwd(u);
              setResetPwdModalOpen(true);
            }}
            onMoveObject={handleOpenMoveObject}
            onAddMemberToGroup={handleOpenManageMembers}
            onRemoveMemberFromGroup={handleRemoveMemberFromGroup}
            onCreateUserInOU={handleOpenCreateUser}
            onCreateGroupInOU={handleOpenCreateGroup}
            onCreateSubOU={handleOpenCreateOU}
          />
        )}

        {activeTab === 'users' && (
          <UsersView
            users={users}
            allGroups={groups}
            loading={dataLoading}
            onCreateUser={() => handleOpenCreateUser('ou=People,dc=neuropunk')}
            onEditUser={handleOpenEditUser}
            onDeleteUser={(u) => {
              setUserToDelete(u);
              setDeleteModalOpen(true);
            }}
            onDisableUser={(u) => {
              setUserToDisable(u);
              setDisableModalOpen(true);
            }}
            onResetPassword={(u) => {
              setUserToResetPwd(u);
              setResetPwdModalOpen(true);
            }}
            onMoveUser={(u) => handleOpenMoveObject(u.dn || `uid=${u.uid},ou=People,dc=neuropunk`, u.cn)}
          />
        )}

        {activeTab === 'groups' && (
          <GroupsView
            groups={groups}
            allUsers={users}
            loading={dataLoading}
            onCreateGroup={() => handleOpenCreateGroup('ou=Groups,dc=neuropunk')}
            onManageMembers={handleOpenManageMembers}
            onMoveGroup={(g) => handleOpenMoveObject(g.dn, g.cn)}
            onSelectUserByDn={handleSelectUserByDn}
          />
        )}

        {activeTab === 'ous' && (
          <OUsView
            ous={ous}
            loading={dataLoading}
            onCreateOU={() => handleOpenCreateOU(directoryTree?.base_dn || 'dc=neuropunk')}
            onMoveOU={(ou) => handleOpenMoveObject(ou.dn, ou.ou)}
          />
        )}

        {activeTab === 'snapshot' && (
          <SnapshotView snapshot={snapshot} loading={dataLoading} />
        )}
      </main>

      {/* Administrative Operations Modals */}
      <UserModal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        onSubmit={handleSubmitUser}
        editUser={editingUser}
        defaultParentDn={userDefaultParentDn}
        allOus={ous}
      />

      <DeleteUserModal
        isOpen={deleteModalOpen}
        user={userToDelete}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteUser}
      />

      <DisableUserModal
        isOpen={disableModalOpen}
        user={userToDisable}
        onClose={() => setDisableModalOpen(false)}
        onConfirm={handleConfirmDisableUser}
      />

      <ResetPasswordModal
        isOpen={resetPwdModalOpen}
        user={userToResetPwd}
        onClose={() => setResetPwdModalOpen(false)}
      />

      <GroupModal
        isOpen={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onSubmit={handleSubmitGroup}
        allUsers={users}
      />

      <ManageMembersModal
        isOpen={manageMembersModalOpen}
        group={groupToManageMembers}
        onClose={() => setManageMembersModalOpen(false)}
        allUsers={users}
        onAddMember={handleAddMemberToGroup}
        onRemoveMember={handleRemoveMemberFromGroup}
      />

      <OUModal
        isOpen={ouModalOpen}
        onClose={() => setOUModalOpen(false)}
        onSubmit={handleSubmitOU}
        defaultParentDn={ouDefaultParentDn}
        allOus={ous}
        baseDn={directoryTree?.base_dn || 'dc=neuropunk'}
      />

      <MoveObjectModal
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        currentDn={objectToMove?.dn || ''}
        objectName={objectToMove?.name || ''}
        allOus={ous}
        onConfirmMove={handleConfirmMoveObject}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
