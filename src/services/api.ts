import {
  AuthUser,
  LDAPDirectoryTree,
  LDAPDirectorySnapshot,
  LDAPUser,
  LDAPUserCreate,
  LDAPUserUpdate,
  LDAPGroup,
  LDAPGroupCreate,
  LDAPOU,
  LDAPOUCreate,
  LDAPMoveObject,
  LDAPGroupMemberAction,
  LDAPActionResponse,
} from '../types/ldap';

const TOKEN_KEY = 'lark_session_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('x-lark-token', token);
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`/api${path}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') || '';
  let data: any = null;
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => null);
  } else {
    data = await res.text().catch(() => null);
  }

  if (!res.ok) {
    let errorMsg = 'Request failed';
    if (data && typeof data === 'object') {
      if (typeof data.detail === 'string') {
        errorMsg = data.detail;
      } else if (Array.isArray(data.detail)) {
        errorMsg = data.detail.map((d: any) => `${d.loc?.join('.') || ''}: ${d.msg}`).join(', ');
      } else if (data.message) {
        errorMsg = data.message;
      }
    } else if (typeof data === 'string' && data) {
      errorMsg = data;
    }
    const error: any = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

export const api = {
  // Authentication
  login: async (username: string, password: string): Promise<{ success: boolean; user: AuthUser; token: string }> => {
    const res = await request<{ success: boolean; user: AuthUser; token: string; message?: string }>('/directory/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  logout: async (): Promise<void> => {
    try {
      await request('/directory/logout', { method: 'POST' });
    } finally {
      setStoredToken(null);
    }
  },

  getCurrentUser: async (): Promise<{ authenticated: boolean; user?: AuthUser; token?: string }> => {
    try {
      const res = await request<{ authenticated: boolean; user?: AuthUser; token?: string }>('/me');
      if (res.token) {
        setStoredToken(res.token);
      }
      return res;
    } catch {
      return { authenticated: false };
    }
  },

  // Directory Hierarchy & Snapshot
  getTree: async (): Promise<LDAPDirectoryTree> => {
    return request<LDAPDirectoryTree>('/directory/tree');
  },

  getSnapshot: async (): Promise<LDAPDirectorySnapshot> => {
    return request<LDAPDirectorySnapshot>('/directory/snapshot');
  },

  // Users
  getUsers: async (): Promise<LDAPUser[]> => {
    return request<LDAPUser[]>('/directory/users');
  },

  getUserByUid: async (uid: string): Promise<LDAPUser> => {
    return request<LDAPUser>(`/directory/users/${encodeURIComponent(uid)}`);
  },

  createUser: async (user: LDAPUserCreate): Promise<LDAPUser> => {
    return request<LDAPUser>('/directory/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  updateUser: async (uid: string, updates: LDAPUserUpdate): Promise<LDAPUser> => {
    return request<LDAPUser>(`/directory/users/${encodeURIComponent(uid)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  deleteUser: async (uid: string): Promise<{ success: boolean; message?: string }> => {
    return request<{ success: boolean; message?: string }>(`/directory/users/${encodeURIComponent(uid)}`, {
      method: 'DELETE',
    });
  },

  disableUser: async (uid: string): Promise<LDAPActionResponse> => {
    return request<LDAPActionResponse>(`/directory/users/${encodeURIComponent(uid)}/disable`, {
      method: 'POST',
    });
  },

  // Groups
  getGroups: async (): Promise<LDAPGroup[]> => {
    return request<LDAPGroup[]>('/directory/groups');
  },

  createGroup: async (group: LDAPGroupCreate): Promise<LDAPGroup> => {
    return request<LDAPGroup>('/directory/groups', {
      method: 'POST',
      body: JSON.stringify(group),
    });
  },

  addUserToGroup: async (action: LDAPGroupMemberAction): Promise<LDAPActionResponse> => {
    return request<LDAPActionResponse>('/directory/groups/members', {
      method: 'POST',
      body: JSON.stringify(action),
    });
  },

  removeUserFromGroup: async (action: LDAPGroupMemberAction): Promise<LDAPActionResponse> => {
    return request<LDAPActionResponse>('/directory/groups/members', {
      method: 'DELETE',
      body: JSON.stringify(action),
    });
  },

  // Organizational Units (OUs)
  getOUs: async (): Promise<LDAPOU[]> => {
    return request<LDAPOU[]>('/directory/ous');
  },

  createOU: async (ou: LDAPOUCreate): Promise<LDAPOU> => {
    return request<LDAPOU>('/directory/ous', {
      method: 'POST',
      body: JSON.stringify(ou),
    });
  },

  // Object Movement
  moveObject: async (moveData: LDAPMoveObject): Promise<LDAPActionResponse> => {
    return request<LDAPActionResponse>('/directory/objects/move', {
      method: 'POST',
      body: JSON.stringify(moveData),
    });
  },
};
