import React, { useState, useEffect } from 'react';
import { Button, Typography, Box } from '@mui/material';
import { ThumbUp as ThumbUpIcon } from '@mui/icons-material';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../config/apiConfig';

const VoteButton = ({ complaintId, initialCount = 0, compact = false }) => {
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkUpvote = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.VOTES.HAS_UPVOTED(complaintId));
        setHasUpvoted(res.data.data || false);
      } catch (e) {}
    };
    if (complaintId) checkUpvote();
  }, [complaintId]);

  const handleVote = async (e) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      if (hasUpvoted) {
        await api.delete(API_ENDPOINTS.VOTES.REMOVE_UPVOTE(complaintId));
        setHasUpvoted(false);
        setCount(c => Math.max(0, c - 1));
      } else {
        await api.post(API_ENDPOINTS.VOTES.UPVOTE(complaintId));
        setHasUpvoted(true);
        setCount(c => c + 1);
      }
    } catch (e) {}
    setLoading(false);
  };

  if (compact) {
    return (
      <Box
        onClick={handleVote}
        sx={{
          display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer',
          color: hasUpvoted ? 'primary.main' : 'text.secondary',
          '&:hover': { color: 'primary.main' },
        }}
      >
        <ThumbUpIcon fontSize="small" />
        <Typography variant="caption">{count}</Typography>
      </Box>
    );
  }

  return (
    <Button
      variant={hasUpvoted ? 'contained' : 'outlined'}
      size="small"
      startIcon={<ThumbUpIcon />}
      onClick={handleVote}
      disabled={loading}
      color="primary"
    >
      {count} {count === 1 ? 'Upvote' : 'Upvotes'}
    </Button>
  );
};

export default VoteButton;
