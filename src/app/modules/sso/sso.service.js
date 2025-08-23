// SSO service: Role mapping and helpers
export function mapRoles (wpRoles) {
  if (!Array.isArray(wpRoles)) return [];
  return wpRoles.map(role => {
    switch (role) {
      case 'administrator': return 'admin';
      case 'subscriber': return 'user';
      case 'member': return 'member';
      default: return role;
    }
  });
}
