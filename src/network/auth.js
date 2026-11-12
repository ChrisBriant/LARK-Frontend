import { conn } from './network';
import { resolveRole } from '../utils/role';

const PROFILE_KEY = 'lark_user_profile';

function login(username, password) {
  return new Promise(async (resolve, reject) => {
    const url = '/directory/login';

    conn
      .post(url, { username, password }, { withCredentials: true })
      .then(async (response) => {
        try {
          // Immediately resolve profile from snapshot to get real LDAP groups
          const snapshotRes = await conn.get('/directory/snapshot', { withCredentials: true });
          const snapshot = snapshotRes.data || {};
          const groups = (snapshot.groups || [])
            .filter((g) => (g.members || []).some((m) => m.includes(`uid=${username},`) || m === username))
            .map((g) => g.cn);

          const matchedUser = (snapshot.users || []).find((u) => u.uid === username) || {};

          const profile = {
            username,
            name: matchedUser.cn || username,
            givenName: matchedUser.given_name || '',
            familyName: matchedUser.sn || '',
            email: matchedUser.mail || '',
            department: matchedUser.department || '',
            title: matchedUser.title || '',
            groups,
            role: resolveRole(groups),
          };

          localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
          return resolve({ ...response.data, profile });
        } catch (e) {
          // Fallback if snapshot fails
          const profile = { username, name: username, groups: [], role: 'USER' };
          localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
          return resolve({ ...response.data, profile });
        }
      })
      .catch((err) => {
        console.error('ERROR REJECT', err);
        return reject(err);
      });
  });
}

function getSession() {
  return new Promise(async (resolve, reject) => {
    // Validate session against LDAP tree endpoint
    const url = '/directory/tree';

    conn
      .get(url, { withCredentials: true })
      .then((response) => {
        const stored = localStorage.getItem(PROFILE_KEY);
        if (stored) {
          try {
            const profile = JSON.parse(stored);
            return resolve(profile);
          } catch (e) {
            // ignore
          }
        }
        return resolve({ username: 'user', groups: [], role: 'USER' });
      })
      .catch((err) => {
        console.error('ERROR REJECT', err);
        return reject(err);
      });
  });
}

function refresh() {
  return new Promise(async (resolve, reject) => {
    const url = '/directory/tree';

    conn
      .get(url, { withCredentials: true })
      .then((response) => {
        return resolve(response.data);
      })
      .catch((err) => {
        console.error('ERROR REJECT', err);
        return reject(err);
      });
  });
}

function signOut() {
  return new Promise(async (resolve, reject) => {
    const url = '/directory/logout';

    conn
      .post(url, {}, { withCredentials: true })
      .then((response) => {
        localStorage.removeItem(PROFILE_KEY);
        return resolve(response.data);
      })
      .catch((err) => {
        console.error('ERROR REJECT', err);
        localStorage.removeItem(PROFILE_KEY);
        return resolve({ success: true });
      });
  });
}

export { login, getSession, signOut, refresh };
