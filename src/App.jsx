import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import LoginScreen from './screens/LoginScreen';
import TreeScreen from './screens/TreeScreen';
import UsersScreen from './screens/UsersScreen';
import GroupsScreen from './screens/GroupsScreen';
import OUsScreen from './screens/OUsScreen';
import SnapshotScreen from './screens/SnapshotScreen';

// Modals
import UserModal from './components/modals/UserModal';
import DeleteModal from './components/modals/DeleteModal';
import DisableModal from './components/modals/DisableModal';
import GroupModal from './components/modals/GroupModal';
import MembersModal from './components/modals/MembersModal';
import OUModal from './components/modals/OUModal';
import MoveModal from './components/modals/MoveModal';

import { getSession, refresh, signOut } from './network/auth';
import {
  getTree,
  getSnapshot,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  disableUser,
  getGroups,
  createGroup,
  addMember,
  removeMember,
  getOUs,
  createOU,
  moveObject,
} from './network/directory';
import { canReadEveryObject } from './utils/role';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [profile, setProfile] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [activeTab, setActiveTab] = useState('tree');
  const [tree, setTree] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [ous, setOus] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  // Modals state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [userToDisable, setUserToDisable] = useState(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [ouModalOpen, setOUModalOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState(null);

  // Auth & Session
  useEffect(() => {
    getSession()
      .then((res) => {
        setAuthenticated(true);
        setProfile(res);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          refresh()
            .then(async () => {
              const freshProfile = await getSession();
              setProfile(freshProfile);
              setAuthenticated(true);
            })
            .catch(() => {
              console.log('THE REFRESH HAS FAILED');
              setAuthenticated(false);
            });
        } else {
          setAuthenticated(false);
        }
      })
      .finally(() => {
        setAuthChecking(false);
      });
  }, []);

  // Fetch Directory Data
  const loadDirectoryData = useCallback(async () => {
    if (!authenticated) return;
    setDataLoading(true);

    try {
      const [treeRes, snapshotRes] = await Promise.all([
        getTree().catch(() => null),
        getSnapshot().catch(() => null),
      ]);

      if (treeRes) setTree(treeRes);
      if (snapshotRes) setSnapshot(snapshotRes);

      const hasFullRead = canReadEveryObject(profile?.role);
      if (hasFullRead) {
        const [usersRes, groupsRes, ousRes] = await Promise.all([
          getUsers().catch(() => snapshotRes?.users || []),
          getGroups().catch(() => snapshotRes?.groups || []),
          getOUs().catch(() => snapshotRes?.ous || []),
        ]);
        setUsers(usersRes || []);
        setGroups(groupsRes || []);
        setOus(ousRes || []);
      } else {
        if (snapshotRes) {
          setUsers(snapshotRes.users || []);
          setGroups(snapshotRes.groups || []);
          setOus(snapshotRes.ous || []);
        }
      }
    } catch (e) {
      console.error('Failed to load directory data:', e);
    } finally {
      setDataLoading(false);
    }
  }, [authenticated, profile?.role]);

  useEffect(() => {
    if (authenticated) {
      loadDirectoryData();
    }
  }, [authenticated, loadDirectoryData]);

  const handleLoginSuccess = (userProfile) => {
    setProfile(userProfile);
    setAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      setAuthenticated(false);
      setProfile(null);
      setTree(null);
      setSnapshot(null);
      setSelectedNode(null);
    }
  };

  // User Actions
  const handleCreateOrUpdateUser = async (data) => {
    if (data.updates) {
      await updateUser(data.uid, data.updates);
    } else {
      await createUser(data);
    }
    await loadDirectoryData();
  };

  const handleConfirmDelete = async (uid) => {
    await deleteUser(uid);
    if (selectedNode?.type === 'user' && selectedNode.data?.uid === uid) {
      setSelectedNode(null);
    }
    await loadDirectoryData();
  };

  const handleConfirmDisable = async (uid) => {
    await disableUser(uid);
    await loadDirectoryData();
  };

  // Group Actions
  const handleCreateGroup = async (groupData) => {
    await createGroup(groupData);
    await loadDirectoryData();
  };

  const handleAddMember = async (groupDn, userDn) => {
    await addMember(userDn, groupDn);
    await loadDirectoryData();
    setActiveGroup((prev) =>
      prev ? { ...prev, members: [...(prev.members || []), userDn] } : null
    );
  };

  const handleRemoveMember = async (groupDn, userDn) => {
    await removeMember(userDn, groupDn);
    await loadDirectoryData();
    setActiveGroup((prev) =>
      prev ? { ...prev, members: (prev.members || []).filter((m) => m !== userDn) } : null
    );
  };

  // OU Actions
  const handleCreateOU = async (ouData) => {
    await createOU(ouData);
    await loadDirectoryData();
  };

  // Move Actions
  const handleConfirmMove = async (currentDn, newParentDn) => {
    await moveObject(currentDn, newParentDn);
    await loadDirectoryData();
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-2" />
        <p className="text-xs text-slate-500 font-mono">Loading LARK...</p>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        profile={profile}
        baseDn={tree?.base_dn || snapshot?.base_dn || 'dc=neuropunk'}
        onRefresh={loadDirectoryData}
        refreshing={dataLoading}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'tree' && (
          <TreeScreen
            tree={tree}
            loading={dataLoading}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            allGroups={groups}
            allUsers={users}
            profile={profile}
            onEditUser={(u) => {
              setEditingUser(u);
              setUserModalOpen(true);
            }}
            onDeleteUser={(u) => {
              setUserToDelete(u);
              setDeleteModalOpen(true);
            }}
            onDisableUser={(u) => {
              setUserToDisable(u);
              setDisableModalOpen(true);
            }}
            onMoveObject={(dn, name) => {
              setItemToMove({ dn, name });
              setMoveModalOpen(true);
            }}
            onAddMemberToGroup={(g) => {
              setActiveGroup(g);
              setMembersModalOpen(true);
            }}
            onRemoveMemberFromGroup={handleRemoveMember}
            onCreateUserInOU={() => {
              setEditingUser(null);
              setUserModalOpen(true);
            }}
            onCreateGroupInOU={() => {
              setGroupModalOpen(true);
            }}
            onCreateSubOU={() => {
              setOUModalOpen(true);
            }}
          />
        )}

        {activeTab === 'users' && (
          <UsersScreen
            users={users}
            loading={dataLoading}
            profile={profile}
            onCreateUser={() => {
              setEditingUser(null);
              setUserModalOpen(true);
            }}
            onEditUser={(u) => {
              setEditingUser(u);
              setUserModalOpen(true);
            }}
            onDeleteUser={(u) => {
              setUserToDelete(u);
              setDeleteModalOpen(true);
            }}
            onDisableUser={(u) => {
              setUserToDisable(u);
              setDisableModalOpen(true);
            }}
            onMoveUser={(u) => {
              setItemToMove({ dn: u.dn || `uid=${u.uid},ou=People,dc=neuropunk`, name: u.cn });
              setMoveModalOpen(true);
            }}
          />
        )}

        {activeTab === 'groups' && (
          <GroupsScreen
            groups={groups}
            allUsers={users}
            loading={dataLoading}
            profile={profile}
            onCreateGroup={() => setGroupModalOpen(true)}
            onManageMembers={(g) => {
              setActiveGroup(g);
              setMembersModalOpen(true);
            }}
            onMoveGroup={(g) => {
              setItemToMove({ dn: g.dn, name: g.cn });
              setMoveModalOpen(true);
            }}
            onSelectUserByDn={(dn) => {
              const matched = users.find((u) => u.dn === dn || dn.includes(`uid=${u.uid},`) || dn === u.uid);
              if (matched) {
                setSelectedNode({ type: 'user', data: matched });
                setActiveTab('tree');
              }
            }}
          />
        )}

        {activeTab === 'ous' && (
          <OUsScreen
            ous={ous}
            loading={dataLoading}
            profile={profile}
            onCreateOU={() => setOUModalOpen(true)}
            onMoveOU={(ou) => {
              setItemToMove({ dn: ou.dn, name: ou.ou });
              setMoveModalOpen(true);
            }}
          />
        )}

        {activeTab === 'snapshot' && <SnapshotScreen snapshot={snapshot} loading={dataLoading} />}
      </main>

      {/* Modals */}
      <UserModal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        onSubmit={handleCreateOrUpdateUser}
        editUser={editingUser}
        allOus={ous}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        user={userToDelete}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <DisableModal
        isOpen={disableModalOpen}
        user={userToDisable}
        onClose={() => setDisableModalOpen(false)}
        onConfirm={handleConfirmDisable}
      />

      <GroupModal
        isOpen={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onSubmit={handleCreateGroup}
        allUsers={users}
      />

      <MembersModal
        isOpen={membersModalOpen}
        group={activeGroup}
        onClose={() => setMembersModalOpen(false)}
        allUsers={users}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
      />

      <OUModal
        isOpen={ouModalOpen}
        onClose={() => setOUModalOpen(false)}
        onSubmit={handleCreateOU}
        allOus={ous}
        baseDn={tree?.base_dn || 'dc=neuropunk'}
      />

      <MoveModal
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        currentDn={itemToMove?.dn || ''}
        objectName={itemToMove?.name || ''}
        allOus={ous}
        onConfirmMove={handleConfirmMove}
      />
    </div>
  );
}
