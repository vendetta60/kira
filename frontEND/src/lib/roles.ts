export function isAdminRole(role: string): boolean {
  return role === 'admin' || role === 'superadmin';
}

export function roleLabel(role: string): string {
  if (role === 'superadmin') return 'Super admin';
  if (role === 'admin') return 'Admin';
  return 'İstifadəçi';
}
