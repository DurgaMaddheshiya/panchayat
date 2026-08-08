// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `/api/auth/login`,
    REGISTER: `/api/auth/register`,
    REFRESH: `/api/auth/refresh`,
    ADMIN_CREATE_USER: `/api/auth/admin/create-user`,
  },
  
  // Users
  USERS: {
    PROFILE: `/api/users/profile`,
    UPDATE_PROFILE: `/api/users/profile`,
    CHANGE_PASSWORD: `/api/users/change-password`,
    BY_ID: (id) => `/api/users/${id}`,
  },
  
  // Complaints
  COMPLAINTS: {
    LIST: `/api/complaints`,
    CREATE: `/api/complaints`,
    BY_ID: (id) => `/api/complaints/${id}`,
    UPDATE: (id) => `/api/complaints/${id}`,
    DELETE: (id) => `/api/complaints/${id}`,
    MY_COMPLAINTS: `/api/complaints/my-complaints`,
    SEARCH: `/api/complaints/search`,
    TRENDING: `/api/complaints/trending`,
    BY_STATUS: (status) => `/api/complaints/by-status/${status}`,
    BY_CATEGORY: (category) => `/api/complaints/by-category/${category}`,
    ASSIGN: (id) => `/api/complaints/${id}/assign`,
    UPDATE_STATUS: (id) => `/api/complaints/${id}/status`,
  },
  
  // Comments
  COMMENTS: {
    CREATE: `/api/comments`,
    BY_COMPLAINT: (id) => `/api/comments/complaint/${id}`,
    UPDATE: (id) => `/api/comments/${id}`,
    DELETE: (id) => `/api/comments/${id}`,
    COUNT: (id) => `/api/comments/complaint/${id}/count`,
  },
  
  // Votes
  VOTES: {
    UPVOTE: (id) => `/api/votes/complaint/${id}/upvote`,
    REMOVE_UPVOTE: (id) => `/api/votes/complaint/${id}/upvote`,
    HAS_UPVOTED: (id) => `/api/votes/complaint/${id}/has-upvoted`,
    COUNT: (id) => `/api/votes/complaint/${id}/count`,
  },
  
  // Notifications
  NOTIFICATIONS: {
    LIST: `/api/notifications`,
    UNREAD_COUNT: `/api/notifications/unread-count`,
    MARK_READ: (id) => `/api/notifications/${id}/mark-read`,
    MARK_ALL_READ: `/api/notifications/mark-all-read`,
    DELETE: (id) => `/api/notifications/${id}`,
  },
  
  // Dashboard
  DASHBOARD: {
    STATS: `/api/dashboard/stats`,
    CITIZEN: (id) => `/api/dashboard/citizen/${id}`,
    SOCIAL_WORKER: (id) => `/api/dashboard/social-worker/${id}`,
  },
};

export default API_BASE_URL;