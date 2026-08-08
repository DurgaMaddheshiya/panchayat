export const COMPLAINT_STATUSES = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REJECTED: 'REJECTED',
};

export const COMPLAINT_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
};

export const COMPLAINT_CATEGORIES = [
  { value: 'ROAD', label: 'Road & Infrastructure' },
  { value: 'WATER', label: 'Water Supply' },
  { value: 'ELECTRICITY', label: 'Electricity' },
  { value: 'SANITATION', label: 'Sanitation & Waste' },
  { value: 'PARKS', label: 'Parks & Gardens' },
  { value: 'NOISE', label: 'Noise Pollution' },
  { value: 'BUILDING', label: 'Illegal Construction' },
  { value: 'DRAINAGE', label: 'Drainage & Sewage' },
  { value: 'STREET_LIGHT', label: 'Street Lights' },
  { value: 'OTHER', label: 'Other' },
];

export const USER_ROLES = {
  CITIZEN: 'CITIZEN',
  OFFICIAL: 'OFFICIAL',
  SOCIAL_WORKER: 'SOCIAL_WORKER',
  ADMIN: 'ADMIN',
};

export const STATUS_COLORS = {
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  RESOLVED: 'success',
  CLOSED: 'default',
  REJECTED: 'error',
};

export const PRIORITY_COLORS = {
  LOW: 'default',
  MEDIUM: 'primary',
  HIGH: 'warning',
  URGENT: 'error',
};

export const PAGINATION_DEFAULTS = {
  PAGE: 0,
  SIZE: 10,
};
