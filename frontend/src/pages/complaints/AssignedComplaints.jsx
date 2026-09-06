import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Table, TableBody, TableCell, TableHead, TableRow, Paper,
  TextField, MenuItem, Pagination, Alert, CircularProgress,
  Avatar, IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Assignment as AssignIcon,
  CheckCircle as CheckIcon,
  Update as UpdateIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import api from '../../services/api';

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

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const AssignedComplaints = () => {
  const navigate = useNavigate();
  
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });

  // Quick Status Update Modal
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAssignedComplaints();
  }, [page, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAssignedComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        size: '10',
        sort: 'createdAt,desc',
      });

      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);

      const res = await api.get(`/api/complaints/assigned-to-me?${params}`);
      const data = res.data?.data || res.data;
      
      setComplaints(data?.content || []);
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      console.error('Failed to fetch assigned complaints:', err);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0); // Reset to first page
  };

  const handleQuickUpdate = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setStatusNote('');
    setUpdateOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedComplaint || !newStatus) return;
    
    try {
      setUpdating(true);
      await api.put(`/api/complaints/${selectedComplaint.id}/status`, {
        status: newStatus,
        officialRemarks: statusNote,
      });
      
      setUpdateOpen(false);
      fetchAssignedComplaints(); // Refresh data
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusActionableText = (status) => {
    switch (status) {
      case 'ASSIGNED': return 'Start Working';
      case 'IN_PROGRESS': return 'Mark Resolved';
      case 'ON_HOLD': return 'Resume Progress';
      default: return 'Update Status';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'ASSIGNED': return 'IN_PROGRESS';
      case 'IN_PROGRESS': return 'RESOLVED';
      case 'ON_HOLD': return 'IN_PROGRESS';
      default: return currentStatus;
    }
  };

  // Compute quick stats
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => ['ASSIGNED', 'UNDER_REVIEW'].includes(c.status)).length,
    inProgress: complaints.filter(c => ['IN_PROGRESS', 'ON_HOLD'].includes(c.status)).length,
    urgent: complaints.filter(c => ['HIGH', 'URGENT'].includes(c.priority)).length,
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
        <Typography variant="h5" fontWeight={700} sx={{ flex: 1 }}>
          📋 My Assigned Complaints
        </Typography>
        <Chip 
          label={`${stats.total} Total`} 
          color="primary" 
          sx={{ fontWeight: 600 }} 
        />
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
            <Typography variant="h4" fontWeight={700} color="warning.main">{stats.pending}</Typography>
            <Typography variant="caption" color="text.secondary">Pending Action</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
            <Typography variant="h4" fontWeight={700} color="info.main">{stats.inProgress}</Typography>
            <Typography variant="caption" color="text.secondary">In Progress</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.50', border: '1px solid', borderColor: 'error.200' }}>
            <Typography variant="h4" fontWeight={700} color="error.main">{stats.urgent}</Typography>
            <Typography variant="caption" color="text.secondary">Urgent/High</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.300' }}>
            <Typography variant="h4" fontWeight={700}>{stats.total}</Typography>
            <Typography variant="caption" color="text.secondary">Total Assigned</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterIcon color="action" />
            <Typography variant="subtitle1" fontWeight={600}>Filters</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth size="small" label="Search"
                placeholder="Title or ID..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select fullWidth size="small" label="Status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                {STATUSES.map(s => (
                  <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select fullWidth size="small" label="Priority"
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <MenuItem value="">All Priority</MenuItem>
                {PRIORITIES.map(p => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined" fullWidth
                onClick={() => {
                  setFilters({ status: '', priority: '', search: '' });
                  setPage(0);
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* High Priority Alert */}
      {stats.urgent > 0 && (
        <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 2 }}>
          <strong>{stats.urgent} urgent/high priority complaints</strong> need immediate attention!
        </Alert>
      )}

      {/* Complaints Table */}
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box textAlign="center" py={6}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading assigned complaints...
              </Typography>
            </Box>
          ) : complaints.length === 0 ? (
            <Box textAlign="center" py={6}>
              <AssignIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No assigned complaints found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Object.values(filters).some(f => f) 
                  ? 'Try adjusting your filters or clear them to see all complaints.'
                  : 'Admin will assign complaints to you.'
                }
              </Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell><strong>Complaint</strong></TableCell>
                    <TableCell><strong>Citizen</strong></TableCell>
                    <TableCell><strong>Priority</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Filed</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow key={complaint.id} hover>
                      <TableCell sx={{ minWidth: 200 }}>
                        <Box>
                          <Typography variant="caption" color="primary" fontWeight={700}>
                            {complaint.complaintId}
                          </Typography>
                          <Typography
                            variant="body2" fontWeight={600}
                            sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                            onClick={() => navigate(`/complaints/${complaint.id}`)}
                          >
                            {complaint.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {complaint.categoryName || complaint.category}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
                            {(complaint.createdBy?.fullName || complaint.createdBy?.name || complaint.citizenName)?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {complaint.createdBy?.fullName || complaint.createdBy?.name || complaint.citizenName || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Ward {complaint.wardNumber || '—'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={complaint.priority} size="small"
                          color={complaint.priority === 'URGENT' || complaint.priority === 'HIGH' ? 'error' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={complaint.status?.replace(/_/g, ' ')}
                          color={statusColors[complaint.status] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString('en-IN') : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/complaints/${complaint.id}`)}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={getStatusActionableText(complaint.status)}>
                            <IconButton
                              size="small" color="primary"
                              onClick={() => handleQuickUpdate(complaint)}
                              disabled={complaint.status === 'RESOLVED'}
                            >
                              <UpdateIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, pt: 1 }}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={(e, newPage) => setPage(newPage - 1)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Quick Status Update Dialog */}
      <Dialog open={updateOpen} onClose={() => setUpdateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <UpdateIcon color="primary" />
            Quick Status Update
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedComplaint && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Complaint: <strong>{selectedComplaint.complaintId}</strong> - {selectedComplaint.title}
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <TextField
                select fullWidth label="New Status" sx={{ mb: 2 }}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {STATUSES.map(s => (
                  <MenuItem key={s} value={s}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {s === 'RESOLVED' && <CheckIcon fontSize="small" color="success" />}
                      {s.replace(/_/g, ' ')}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth multiline rows={3}
                label="Official Remarks (Optional)"
                placeholder="Add notes about progress, resolution, or next steps..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleStatusUpdate}
            disabled={updating || !newStatus}
            startIcon={updating ? <CircularProgress size={16} /> : <CheckIcon />}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignedComplaints;