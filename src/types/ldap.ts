export type UserRole = 'GLOBAL_ADMIN' | 'GLOBAL_READER' | 'DEMO_USERS' | 'USER';

export interface AuthUser {
  username: string;
  name: string;
  givenName?: string;
  familyName?: string;
  email: string;
  department?: string;
  title?: string;
  groups: string[];
  role: UserRole;
  exp?: number;
}

export interface LDAPUser {
  uid: string;
  cn: string;
  sn: string;
  given_name: string;
  mail: string;
  department?: string | null;
  title?: string | null;
  dn?: string | null;
  object_classes?: string[];
}

export interface LDAPUserCreate {
  uid: string;
  cn: string;
  sn: string;
  given_name: string;
  mail: string;
  department?: string | null;
  title?: string | null;
  dn?: string | null;
  object_classes?: string[];
}

export interface LDAPUserUpdate {
  cn?: string | null;
  sn?: string | null;
  given_name?: string | null;
  mail?: string | null;
  department?: string | null;
  title?: string | null;
}

export interface LDAPGroup {
  dn: string;
  cn: string;
  description?: string | null;
  members?: string[];
  object_classes?: string[];
}

export interface LDAPGroupCreate {
  cn: string;
  description?: string | null;
  members?: string[];
  object_classes?: string[];
}

export interface LDAPOU {
  dn: string;
  ou: string;
  description?: string | null;
  object_classes?: string[];
}

export interface LDAPOUCreate {
  name: string;
  description?: string | null;
  parent_dn?: string | null;
  object_classes?: string[];
}

export interface LDAPMoveObject {
  current_dn: string;
  new_parent_dn: string;
}

export interface LDAPGroupMemberAction {
  user_dn: string;
  group_dn: string;
}

export interface LDAPTreeOU {
  ou: string;
  dn: string;
  description?: string | null;
  users?: LDAPUser[];
  groups?: LDAPGroup[];
  children_ous?: LDAPTreeOU[];
}

export interface LDAPDirectoryTree {
  base_dn: string;
  root_ous: LDAPTreeOU[];
}

export interface LDAPDirectorySnapshot {
  base_dn: string;
  ous: LDAPOU[];
  users: LDAPUser[];
  groups: LDAPGroup[];
}

export interface LDAPActionResponse {
  success: boolean;
  message: string;
  ldap_code?: number;
  details?: string | null;
}

export type SelectedNode =
  | { type: 'ou'; data: LDAPTreeOU | LDAPOU }
  | { type: 'user'; data: LDAPUser }
  | { type: 'group'; data: LDAPGroup }
  | { type: 'root'; baseDn: string };
