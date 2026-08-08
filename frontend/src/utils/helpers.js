// Date formatting
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', ...options,
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const timeAgo = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateString);
};

// String helpers
export const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const truncate = (str, len = 100) => {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatStatus = (status) => {
  if (!status) return '';
  return status.replace(/_/g, ' ');
};

// Role helpers
export const getRoleLabel = (role) => {
  const map = {
    CITIZEN: 'Citizen',
    ROLE_CITIZEN: 'Citizen',
    OFFICIAL: 'Government Official',
    ROLE_OFFICIAL: 'Government Official',
    SOCIAL_WORKER: 'Social Worker',
    ROLE_SOCIAL_WORKER: 'Social Worker',
    ADMIN: 'Administrator',
    ROLE_ADMIN: 'Administrator',
  };
  return map[role] || role;
};

export const isAdmin = (role) =>
  ['ADMIN', 'ROLE_ADMIN'].includes(role);

export const isOfficial = (role) =>
  ['OFFICIAL', 'ROLE_OFFICIAL', 'SOCIAL_WORKER', 'ROLE_SOCIAL_WORKER', 'ADMIN', 'ROLE_ADMIN'].includes(role);

// Number formatting
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};
