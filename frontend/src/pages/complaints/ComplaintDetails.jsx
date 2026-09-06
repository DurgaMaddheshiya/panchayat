import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Divider, Avatar, TextField, CircularProgress, MenuItem,
  Paper, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
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
    }
  }, [complaint]);

  const fetchComments = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.COMMENTS.BY_COMPLAINT(id));
      setComments(res.data.data?.content || res.data.data || []);
    } catch (e) {}
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
      setAssignSuccess('Complaint assigned successfully!');
      setAssignOpen(false);
      dispatch(fetchComplaintById(id));
      setTimeout(() => setAssignSuccess(''), 3000);
    } catch (e) {
      console.error('Assign failed', e);
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
                        {complaint.assignedToName?.[0] || 'O'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{complaint.assignedToName}</Typography>
                        <Typography variant="caption" color="text.secondary">{complaint.assignedToEmail}</Typography>
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
              <Typography variant="h6" fontWeight={600} gutterBottom>Complaint Info</Typography>
              <Divider sx={{ mb: 2 }} />
              {[
                { label: 'Complaint ID', value: complaint.complaintId },
                { label: 'Category', value: complaint.categoryName || complaint.category },
                { label: 'Priority', value: complaint.priority },
                { label: 'Ward', value: complaint.wardNumber || 'N/A' },
                { label: 'Filed By', value: complaint.citizenName },
                { label: 'Assigned To', value: complaint.assignedToName || '—' },
                { label: 'Filed On', value: complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString('en-IN') : 'N/A' },
                { label: 'Last Updated', value: complaint.updatedAt ? new Date(complaint.updatedAt).toLocaleDateString('en-IN') : 'N/A' },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={600} textAlign="right" sx={{ maxWidth: '55%' }}>{value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Assign Dialog */}
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
