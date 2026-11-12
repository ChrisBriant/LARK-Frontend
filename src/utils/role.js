export function resolveRole(groups = []) {
  if (groups.includes('GLOBAL_ADMIN')) return 'GLOBAL_ADMIN';
  if (groups.includes('GLOBAL_READER')) return 'GLOBAL_READER';
  if (groups.includes('DEMO_USERS')) return 'DEMO_USERS';
  return 'USER';
}

export function canAdmin(role) {
  return role === 'GLOBAL_ADMIN';
}

export function canReadEveryObject(role) {
  return role === 'GLOBAL_ADMIN' || role === 'GLOBAL_READER';
}
