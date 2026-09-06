import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Divider, Avatar, TextField, CircularProgress, MenuItem,
  Paper, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  Rating, FormControlLabel, Checkbox, Stack,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ThumbUp as ThumbUpIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  RateReview as RateReviewIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { fetchComplaintById, deleteComplaint } from '../../redux/slices/complaintSlice';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Loader from '../../components/common/Loader';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const statusColors = {
  SUBMITTED: 'default',
  UNDER_REVIEW: 'info',
  ASSIGNED: 'info',
  IN_PROGRESS: 'warning',
  ON_HOLD: 'warning',
  RESOLVED: 'success',
  REJECTED: 'error',
};

const STATUSES = [
  'SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED',
  'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'REJECTED'
];

const ComplaintDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentComplaint: complaint, loading } = useSelector((state) => state.complaints);
  const { user } = useSelector((state) => state.auth);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [statusSuccess, setStatusSuccess] = useState('');

  // Assignment states
  const [assignOpen, setAssignOpen] = useState(false);
  const [officials, setOfficials] = useState([]);
  const [selectedOfficial, setSelectedOfficial] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState('');

  // Rating states
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState('');
  const [canRate, setCanRate] = useState(false);
  const [existingRating, setExistingRating] = useState(null);

  const isCitizen = ['CITIZEN', 'ROLE_CITIZEN'].includes(user?.role);

  const isAdmin = ['ADMIN', 'ROLE_ADMIN'].includes(user?.role);
  const isOfficial = ['OFFICIAL', 'ROLE_OFFICIAL', 'SOCIAL_WORKER', 'ROLE_SOCIAL_WORKER', 'ADMIN', 'ROLE_ADMIN'].includes(user?.role);
  const isOwner = complaint?.createdBy?.id === user?.id || complaint?.createdBy?.id === parseInt(user?.id);

  useEffect(() => {
    dispatch(fetchComplaintById(id));
    fetchComments();
    fetchUpvoteStatus();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (complaint) {
      setUpvoteCount(complaint.upvoteCount || 0);
      setStatusUpdate(complaint.status || '');
      // Check rating eligibility when complaint loads
      if (isCitizen && complaint.status === 'RESOLVED') {
        fetchCanRate();
      }
    }
  }, [complaint]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchComments = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.COMMENTS.BY_COMPLAINT(id));
      setComments(res.data.data?.content || res.data.data || []);
    } catch (e) {}
  };

  const fetchCanRate = async () => {
    try {
      const res = await api.get(`/api/ratings/can-rate/${id}`);
      setCanRate(res.data?.data === true);
    } catch (e) {
      setCanRate(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!ratingValue) return;
    setRatingLoading(true);
    try {
      await api.post('/api/ratings/submit', {
        complaintId: parseInt(id),
        rating: ratingValue,
        feedback: ratingFeedback,
        isAnonymous,
      });
      setRatingSuccess('Thank you for your feedback!');
      setRatingOpen(false);
      setCanRate(false);
      setExistingRating(ratingValue);
      setTimeout(() => setRatingSuccess(''), 4000);
    } catch (e) {
      console.error('Rating failed:', e);
    } finally {
      setRatingLoading(false);
    }
  };

  const fetchUpvoteStatus = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.VOTES.HAS_UPVOTED(id));
      setHasUpvoted(res.data.data || false);
    } catch (e) {}
  };

  const fetchOfficials = async () => {
    try {
      const res = await api.get('/api/users/officials');
      const data = res.data?.data || res.data;
      setOfficials(Array.isArray(data) ? data : []);
    } catch (e) {
      setOfficials([]);
    }
  };

  const handleOpenAssign = () => {
    fetchOfficials();
    setSelectedOfficial(complaint?.assignedTo?.id || '');
    setAssignOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedOfficial) return;
    setAssignLoading(true);
    try {
      await api.put(`${API_ENDPOINTS.COMPLAINTS.ASSIGN(id)}?assigneeId=${selectedOfficial}`);
      setAssignSuccess('✅ Complaint assigned successfully! Page will refresh...');
      setAssignOpen(false);
      
      // Refresh complaint data to show assigned official
      setTimeout(async () => {
        await dispatch(fetchComplaintById(id));
        setAssignSuccess('Complaint assigned and details updated!');
        setTimeout(() => setAssignSuccess(''), 3000);
      }, 500);
      
    } catch (e) {
      console.error('Assign failed', e);
      setAssignSuccess('❌ Failed to assign complaint. Please try again.');
      setTimeout(() => setAssignSuccess(''), 3000);
    }
    setAssignLoading(false);
  };

  const handleUpvote = async () => {
    try {
      if (hasUpvoted) {
        await api.delete(API_ENDPOINTS.VOTES.REMOVE_UPVOTE(id));
        setHasUpvoted(false);
        setUpvoteCount(c => c - 1);
      } else {
        await api.post(API_ENDPOINTS.VOTES.UPVOTE(id));
        setHasUpvoted(true);
        setUpvoteCount(c => c + 1);
      }
    } catch (e) {}
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      await api.post(API_ENDPOINTS.COMMENTS.CREATE, {
        complaintId: parseInt(id),
        content: newComment,
      });
      setNewComment('');
      fetchComments();
    } catch (e) {}
    setCommentLoading(false);
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdate) return;
    try {
      await api.put(API_ENDPOINTS.COMPLAINTS.UPDATE_STATUS(id), {
        status: statusUpdate,
        officialRemarks: statusNote,
      });
      dispatch(fetchComplaintById(id));
      setStatusNote('');
      setStatusSuccess('Status updated successfully!');
      setTimeout(() => setStatusSuccess(''), 3000);
    } catch (e) {}
  };

  const handleDelete = async () => {
    const result = await dispatch(deleteComplaint(id));
    if (result.type === 'complaints/delete/fulfilled') {
      navigate('/complaints');
    }
    setDeleteOpen(false);
  };

  if (loading || !complaint) return <Loader message="Loading complaint..." />;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)}>Back</Button>
        <Typography variant="h5" fontWeight={700} sx={{ flex: 1 }}>
          Complaint Details
        </Typography>
        {isOwner && ['SUBMITTED', 'UNDER_REVIEW'].includes(complaint.status) && (
          <Button variant="outlined" startIcon={<EditIcon />} onClick={() => navigate(`/complaints/${id}/edit`)}>
            Edit
          </Button>
        )}
        {(isOwner || isAdmin) && (
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)}>
            Delete
          </Button>
        )}
      </Box>

      {assignSuccess && <Alert severity="success" sx={{ mb: 2 }}>{assignSuccess}</Alert>}

      <Grid container spacing={3}>
        {/* Main content */}
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {complaint.complaintId}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={complaint.priority} size="small"
                    color={complaint.priority === 'HIGH' || complaint.priority === 'URGENT' ? 'error' : 'default'}
                  />
                  <Chip
                    label={complaint.status?.replace(/_/g, ' ')}
                    color={statusColors[complaint.status] || 'default'}
                    size="small"
                  />
                </Box>
              </Box>

              <Typography variant="h5" fontWeight={700} gutterBottom>
                {complaint.title}
              </Typography>

              <Box sx={{ display: 'flex', gap: 3, mb: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">{complaint.citizenName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">{complaint.address || complaint.location || 'N/A'}</Typography>
                </Box>
              </Box>

              <Chip label={complaint.categoryName || complaint.category} variant="outlined" size="small" sx={{ mb: 2 }} />
              <Divider sx={{ mb: 2 }} />

              <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {complaint.description}
              </Typography>

              {/* Admin Remarks */}
              {complaint.adminRemarks && (
                <Paper sx={{ mt: 2, p: 2, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200', borderRadius: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600} color="info.main" gutterBottom>
                    Official Remarks:
                  </Typography>
                  <Typography variant="body2">{complaint.adminRemarks}</Typography>
                </Paper>
              )}

              {/* Upvote */}
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant={hasUpvoted ? 'contained' : 'outlined'}
                  startIcon={<ThumbUpIcon />}
                  onClick={handleUpvote}
                  color="primary"
                >
                  {upvoteCount} Upvote{upvoteCount !== 1 ? 's' : ''}
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Support this complaint to increase its priority
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Comments ({comments.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 14 }}>
                  {user?.fullName?.[0] || 'U'}
                </Avatar>
                <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth size="small" placeholder="Write a comment..."
                    value={newComment} onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                    multiline maxRows={3}
                  />
                  <Button
                    variant="contained" size="small"
                    onClick={handleAddComment}
                    disabled={commentLoading || !newComment.trim()}
                    sx={{ minWidth: 40, px: 1.5 }}
                  >
                    {commentLoading ? <CircularProgress size={16} /> : <SendIcon fontSize="small" />}
                  </Button>
                </Box>
              </Box>

              {comments.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={2}>
                  No comments yet. Be the first to comment!
                </Typography>
              ) : (
                comments.map((comment) => (
                  <Box key={comment.id} sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36, fontSize: 14 }}>
                      {comment.authorName?.[0] || 'U'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Typography variant="subtitle2" fontWeight={600}>{comment.authorName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                        </Typography>
                        {comment.isOfficial && <Chip label="Official" size="small" color="primary" />}
                      </Box>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>{comment.content}</Typography>
                    </Box>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>

          {/* Assign to Official (admin only) */}
          {isAdmin && (
            <Card elevation={2} sx={{ borderRadius: 2, mb: 2, border: '1px solid', borderColor: 'primary.200' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  👮 Assign to Official
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {complaint.assignedTo ? (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Currently Assigned To:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: 'success.50', borderRadius: 1, border: '1px solid', borderColor: 'success.200' }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.main', fontSize: 13 }}>
                        {(complaint.assignedTo?.fullName || complaint.assignedTo?.name)?.[0] || 'O'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {complaint.assignedTo?.fullName || complaint.assignedTo?.name || 'Official'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {complaint.assignedTo?.email || ''}
                        </Typography>
                        <Typography variant="caption" color="success.dark" display="block">
                          {complaint.assignedTo?.role?.toString().replace('ROLE_','').replace('_',' ')}
                        </Typography>
                      </Box>
                      <CheckIcon color="success" sx={{ ml: 'auto' }} />
                    </Box>
                  </Box>
                ) : (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Not assigned yet
                  </Alert>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AssignIcon />}
                  onClick={handleOpenAssign}
                >
                  {complaint.assignedTo ? 'Reassign' : 'Assign to Official'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Status Update (officials/admin) */}
          {isOfficial && (
            <Card elevation={2} sx={{ borderRadius: 2, mb: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Update Status
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {statusSuccess && <Alert severity="success" sx={{ mb: 2 }}>{statusSuccess}</Alert>}
                <TextField
                  select fullWidth size="small" label="New Status"
                  value={statusUpdate} onChange={(e) => setStatusUpdate(e.target.value)}
                  sx={{ mb: 2 }}
                >
                  {STATUSES.map(s => (
                    <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth size="small" multiline rows={2}
                  label="Official Remarks (optional)"
                  value={statusNote} onChange={(e) => setStatusNote(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button variant="contained" fullWidth onClick={handleStatusUpdate}>
                  Update Status
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Complaint Info */}
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                📋 Complaint Info
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {/* Complaint ID */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Complaint ID</Typography>
                <Typography variant="body1" fontWeight={700} color="primary.main">
                  {complaint.complaintId || 'N/A'}
                </Typography>
              </Box>

              {/* Category with Color Coding */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Category</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip 
                    label={complaint.categoryName || complaint.category || 'N/A'} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
              </Box>

              {/* Priority with Color Coding */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Priority</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip 
                    label={complaint.priority || 'N/A'} 
                    size="small" 
                    color={
                      complaint.priority === 'URGENT' ? 'error' : 
                      complaint.priority === 'HIGH' ? 'warning' : 
                      complaint.priority === 'MEDIUM' ? 'info' : 'default'
                    }
                  />
                </Box>
              </Box>

              {/* Ward */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Ward</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {complaint.wardNumber ? `Ward ${complaint.wardNumber}` : 'N/A'}
                </Typography>
              </Box>

              {/* Filed By */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Filed By</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                    {complaint.citizenName?.[0] || 'U'}
                  </Avatar>
                  <Typography variant="body2" fontWeight={600}>
                    {complaint.citizenName || 'Unknown User'}
                  </Typography>
                </Box>
              </Box>

              {/* Assigned To */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Assigned To</Typography>
                {complaint.assignedTo ? (
                  <Box sx={{ 
                    display: 'flex', alignItems: 'center', gap: 1, mt: 0.5,
                    p: 1, bgcolor: 'success.50', borderRadius: 1, border: '1px solid', borderColor: 'success.200' 
                  }}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'success.main' }}>
                      {(complaint.assignedTo?.fullName || complaint.assignedTo?.name)?.[0] || 'O'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="success.dark">
                        {complaint.assignedTo?.fullName || complaint.assignedTo?.name || 'Official'}
                      </Typography>
                      <Typography variant="caption" color="success.dark">
                        {complaint.assignedTo?.role?.toString().replace('ROLE_','').replace(/_/g,' ')}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', alignItems: 'center', gap: 1, mt: 0.5,
                    p: 1, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.300' 
                  }}>
                    <PersonIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                    <Typography variant="body2" color="text.disabled">
                      Not assigned yet
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Filed On */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Filed On</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" fontWeight={600}>
                    {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    }) : 'N/A'}
                  </Typography>
                </Box>
              </Box>

              {/* Last Updated */}
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" fontWeight={600}>
                    {complaint.updatedAt ? new Date(complaint.updatedAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    }) : 'N/A'}
                  </Typography>
                </Box>
              </Box>

              {/* Status */}
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Current Status</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={complaint.status?.replace(/_/g, ' ') || 'Unknown'}
                    color={statusColors[complaint.status] || 'default'}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Rating Card - shown to citizen for resolved complaints */}
          {isCitizen && complaint.status === 'RESOLVED' && complaint.assignedTo && (
            <Card elevation={2} sx={{ borderRadius: 2, mt: 2, border: '2px solid', borderColor: canRate ? 'warning.300' : 'success.200' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon sx={{ color: 'warning.main' }} />
                  Rate Official
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
                    {(complaint.assignedTo?.fullName || complaint.assignedTo?.name)?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      {complaint.assignedTo?.fullName || complaint.assignedTo?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {complaint.assignedTo?.role?.toString().replace('ROLE_','').replace(/_/g,' ')}
                    </Typography>
                  </Box>
                </Box>

                {existingRating ? (
                  <Box sx={{ textAlign: 'center', py: 1 }}>
                    <Rating value={existingRating} readOnly size="large" />
                    <Typography variant="caption" color="success.main" display="block" sx={{ mt: 0.5 }}>
                      ✅ You have rated this official
                    </Typography>
                  </Box>
                ) : canRate ? (
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<RateReviewIcon />}
                    onClick={() => setRatingOpen(true)}
                    sx={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
                  >
                    Give Feedback & Rating
                  </Button>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 1 }}>
                    <Rating value={0} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      Rating already submitted
                    </Typography>
                  </Box>
                )}

                {ratingSuccess && (
                  <Alert severity="success" sx={{ mt: 1 }} icon={<StarIcon />}>
                    {ratingSuccess}
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

        </Grid>
      </Grid>

      {/* Rating Dialog */}
      <Dialog open={ratingOpen} onClose={() => setRatingOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RateReviewIcon color="warning" />
            <Typography variant="h6" fontWeight={700}>Rate Official Performance</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Official Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2, mb: 3 }}>
            <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', fontSize: 18 }}>
              {(complaint.assignedTo?.fullName || complaint.assignedTo?.name)?.[0]}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                {complaint.assignedTo?.fullName || complaint.assignedTo?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {complaint.assignedTo?.role?.toString().replace('ROLE_','').replace(/_/g,' ')} •
                Complaint: {complaint.complaintId}
              </Typography>
            </Box>
          </Box>

          {/* Star Rating */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="body1" fontWeight={600} gutterBottom>
              How would you rate this official's performance?
            </Typography>
            <Rating
              value={ratingValue}
              onChange={(_, val) => setRatingValue(val)}
              size="large"
              sx={{ fontSize: '3rem' }}
              icon={<StarIcon fontSize="inherit" />}
              emptyIcon={<StarBorderIcon fontSize="inherit" />}
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              {ratingValue === 1 && '⭐ Poor'}
              {ratingValue === 2 && '⭐⭐ Fair'}
              {ratingValue === 3 && '⭐⭐⭐ Good'}
              {ratingValue === 4 && '⭐⭐⭐⭐ Very Good'}
              {ratingValue === 5 && '⭐⭐⭐⭐⭐ Excellent!'}
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Feedback Text */}
          <TextField
            fullWidth multiline rows={3}
            label="Your Feedback (Optional)"
            placeholder="Share your experience with this official... Was the issue resolved properly? Was communication good?"
            value={ratingFeedback}
            onChange={(e) => setRatingFeedback(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Quick feedback chips */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Quick Tags:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {['Quick Response', 'Professional', 'Resolved Properly', 'Good Communication', 'Needs Improvement'].map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant={ratingFeedback.includes(tag) ? 'filled' : 'outlined'}
                  color={ratingFeedback.includes(tag) ? 'primary' : 'default'}
                  onClick={() => {
                    if (ratingFeedback.includes(tag)) {
                      setRatingFeedback(prev => prev.replace(tag + '. ', '').replace(tag, '').trim());
                    } else {
                      setRatingFeedback(prev => prev ? `${prev}. ${tag}` : tag);
                    }
                  }}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Stack>
          </Box>

          {/* Anonymous Option */}
          <FormControlLabel
            control={
              <Checkbox
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                Submit anonymously (your name won't be shown publicly)
              </Typography>
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRatingOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitRating}
            disabled={ratingLoading || !ratingValue}
            startIcon={ratingLoading ? <CircularProgress size={16} /> : <StarIcon />}
            sx={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', minWidth: 140 }}
          >
            {ratingLoading ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignIcon color="primary" />
            Assign Complaint to Official
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select an official or social worker to handle this complaint.
          </Typography>

          {officials.length === 0 ? (
            <Alert severity="info">
              No officials found. Create official accounts from Manage Users.
            </Alert>
          ) : (
            <TextField
              select fullWidth label="Select Official"
              value={selectedOfficial}
              onChange={(e) => setSelectedOfficial(e.target.value)}
            >
              <MenuItem value="">— Unassign —</MenuItem>
              {officials.map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.main' }}>
                      {o.fullName?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{o.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {o.role} • {o.email}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAssign}
            disabled={assignLoading || !selectedOfficial}
            startIcon={assignLoading ? <CircularProgress size={16} /> : <AssignIcon />}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Complaint"
        message="Are you sure you want to delete this complaint? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </Box>
  );
};

export default ComplaintDetails;
