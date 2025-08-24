// SSO service: Role mapping and helpers
export function mapRoles(wpRoles) {
  if (!Array.isArray(wpRoles)) {
    if (!wpRoles) return ['user']; // Default role
    if (typeof wpRoles === 'string') wpRoles = [wpRoles];
    else if (typeof wpRoles === 'object') wpRoles = Object.values(wpRoles);
    else return ['user'];
  }

  return wpRoles.map(role => {
    switch (role.toLowerCase()) {
      case 'administrator':
      case 'admin':
        return 'admin';
      case 'subscriber':
        return 'user';
      case 'member':
        return 'member';
      case 'contributor':
        return 'contributor';
      case 'author':
        return 'author';
      case 'editor':
        return 'editor';
      default:
        return role.toLowerCase();
    }
  }).filter(Boolean); // Remove any empty values
}

// Helper to check if user has specific role
export function hasRole(user, role) {
  if (!user || !user.roles || !Array.isArray(user.roles)) {
    return false;
  }
  return user.roles.includes(role);
}

// Helper to check if user has admin privileges
export function isAdmin(user) {
  return hasRole(user, 'admin') || hasRole(user, 'administrator');
}

// Helper to check if token is expired
export function isTokenExpired(tokenExpiry) {
  if (!tokenExpiry) return true;
  return new Date() >= new Date(tokenExpiry);
}

// Helper to get user display name
export function getUserDisplayName(user) {
  if (!user) return 'Unknown User';
  return user.displayName || user.firstName + ' ' + user.lastName || user.username || user.email;
}