import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardActionArea, CardContent, Box, Typography, Chip,
} from '@mui/material';
import { LocationOn as LocationIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import StatusBadge from './StatusBadge';
import VoteButton from './VoteButton';

const priorityColors = {
  LOW: 'default', MEDIUM: 'primary', HIGH: 'warning', URGENT: 'error',
};

const ComplaintCard = ({ complaint }) => {
  const navigate = useNavigate();

  return (
    <Card elevation={1} sx={{ borderRadius: 2, '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s' }}>
      <CardActionArea onClick={() => navigate(`/complaints/${complaint.id}`)}>
        <CardContent>
          {/* Top row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {complaint.complaintId}
              </Typography>
              <Chip
                label={complaint.categoryName || complaint.category}
                size="small"
                variant="outlined"
              />
              <Chip
                label={complaint.priority}
                size="small"
                color={priorityColors[complaint.priority] || 'default'}
              />
            </Box>
            <StatusBadge status={complaint.status} />
          </Box>

          {/* Title */}
          <Typography variant="subtitle1" fontWeight={600} gutterBottom noWrap>
            {complaint.title}
          </Typography>

          {/* Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 1.5,
            }}
          >
            {complaint.description}
          </Typography>

          {/* Bottom meta */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 140 }}>
                  {complaint.address || complaint.location || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {complaint.createdAt
                    ? new Date(complaint.createdAt).toLocaleDateString('en-IN')
                    : 'N/A'}
                </Typography>
              </Box>
            </Box>
            <VoteButton
              complaintId={complaint.id}
              initialCount={complaint.upvoteCount || 0}
              compact
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ComplaintCard;
