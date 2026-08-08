import React from 'react';
import { Chip } from '@mui/material';

const statusConfig = {
  PENDING: { label: 'Pending', color: 'warning' },
  IN_PROGRESS: { label: 'In Progress', color: 'info' },
  RESOLVED: { label: 'Resolved', color: 'success' },
  CLOSED: { label: 'Closed', color: 'default' },
  REJECTED: { label: 'Rejected', color: 'error' },
};

const StatusBadge = ({ status, size = 'small' }) => {
  const config = statusConfig[status] || { label: status, color: 'default' };
  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      sx={{ fontWeight: 600 }}
    />
  );
};

export default StatusBadge;
