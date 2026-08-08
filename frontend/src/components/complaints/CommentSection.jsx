import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Avatar, TextField, Button, Divider,
  CircularProgress, Chip, IconButton, Tooltip,
} from '@mui/material';
import { Send as SendIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { toast } from 'react-toastify';

const CommentSection = ({ complaintId }) => {
  const { user } = useSelector((state) => state.auth);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = ['ADMIN', 'ROLE_ADMIN', 'OFFICIAL', 'ROLE_OFFICIAL'].includes(user?.role);

  useEffect(() => {
    fetchComments();
  }, [complaintId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.COMMENTS.BY_COMPLAINT(complaintId));
      setComments(res.data.data?.content || res.data.data || []);
    } catch (e) {}
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await api.post(API_ENDPOINTS.COMMENTS.CREATE, {
        complaintId: parseInt(complaintId),
        content: newComment.trim(),
      });
      setNewComment('');
      fetchComments();
      toast.success('Comment added!');
    } catch (e) {}
    setSubmitting(false);
  };

  const handleDelete = async (commentId) => {
    try {
      await api.delete(API_ENDPOINTS.COMMENTS.DELETE(commentId));
      setComments(comments.filter(c => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (e) {}
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Comments ({comments.length})
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* New comment input */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, alignItems: 'flex-start' }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 13, mt: 0.5 }}>
          {getInitials(user?.fullName || user?.name)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            size="small"
            placeholder="Write a comment... (Enter to submit)"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
            <Button
              variant="contained"
              size="small"
              endIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <SendIcon />}
              onClick={handleSubmit}
              disabled={submitting || !newComment.trim()}
            >
              Comment
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Comments list */}
      {loading ? (
        <Box textAlign="center" py={2}>
          <CircularProgress size={24} />
        </Box>
      ) : comments.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={3} variant="body2">
          No comments yet. Start the conversation!
        </Typography>
      ) : (
        comments.map((comment) => (
          <Box key={comment.id} sx={{ display: 'flex', gap: 1.5, mb: 2.5 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36, fontSize: 13, mt: 0.5 }}>
              {getInitials(comment.authorName)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle2" fontWeight={600}>{comment.authorName}</Typography>
                {comment.isOfficial && (
                  <Chip label="Official" size="small" color="primary" sx={{ height: 18, fontSize: 11 }} />
                )}
                <Typography variant="caption" color="text.secondary">
                  {comment.createdAt ? new Date(comment.createdAt).toLocaleString('en-IN') : ''}
                </Typography>
                {(isAdmin || comment.authorId === user?.id) && (
                  <Tooltip title="Delete comment">
                    <IconButton size="small" onClick={() => handleDelete(comment.id)} sx={{ ml: 'auto' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              <Box
                sx={{
                  mt: 0.5, p: 1.5,
                  bgcolor: 'action.hover',
                  borderRadius: 1.5,
                  borderLeft: comment.isOfficial ? '3px solid' : 'none',
                  borderColor: 'primary.main',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {comment.content}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))
      )}
    </Box>
  );
};

export default CommentSection;
