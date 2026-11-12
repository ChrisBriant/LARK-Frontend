import { conn } from './network';

function getTree() {
  return new Promise(async (resolve, reject) => {
    conn
      .get('/directory/tree', { withCredentials: true })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

function getSnapshot() {
  return new Promise(async (resolve, reject) => {
    conn
      .get('/directory/snapshot', { withCredentials: true })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

function getUsers() {
  return new Promise(async (resolve, reject) => {
    conn
      .get('/directory/users', { withCredentials: true })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

function getUser(uid) {
  return new Promise(async (resolve, reject) => {
    conn
      .get(`/directory/users/${encodeURIComponent(uid)}`, { withCredentials: true })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

function createUser(userData) {
  return new Promise(async (resolve, reject) => {
    conn
      .post('/directory/users', userData, { withCredentials: true })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

function updateUser(uid, updates) {
  return new Promise(async (resolve, reject) => {
    conn
      .patch(`/directory/users/${encodeURIComponent(uid)}`, updates, { withCredentials: true })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

function deleteUser(uid) {
  return new Promise(async (resolve, reject) => {
    conn
      .delete(`/directory/users/${encodeURIComponent(uid)}`, { withCredentials: true })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

function disableUser(uid) {
  return new Promise(async (resolve, reject) => {
    conn
      .post(`/directory/users/${encodeURIComponent(uid)}/disable`, {}, { withCredentials: true })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

function getGroups() {
  return new Promise(async (resolve, reject) => {
    conn
      .get('/directory/groups', { withCredentials: true })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

function createGroup(groupData) {
  return new Promise(async (resolve, reject) => {
    conn
      .post('/directory/groups', groupData, { withCredentials: true })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

function addMember(user_dn, group_dn) {
  return new Promise(async (resolve, reject) => {
    conn
      .post('/directory/groups/members', { user_dn, group_dn }, { withCredentials: true })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

function removeMember(user_dn, group_dn) {
  return new Promise(async (resolve, reject) => {
    conn
      .delete('/directory/groups/members', {
        data: { user_dn, group_dn },
        withCredentials: true,
      })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

function getOUs() {
  return new Promise(async (resolve, reject) => {
    conn
      .get('/directory/ous', { withCredentials: true })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

function createOU(ouData) {
  return new Promise(async (resolve, reject) => {
    conn
      .post('/directory/ous', ouData, { withCredentials: true })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

function moveObject(current_dn, new_parent_dn) {
  return new Promise(async (resolve, reject) => {
    conn
      .post('/directory/objects/move', { current_dn, new_parent_dn }, { withCredentials: true })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export {
  getTree,
  getSnapshot,
  getUsers,
  getUser,
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
};
