import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Button, TextField, MenuItem,
  InputAdornment, Pagination, Chip, Card, CardContent,
  CardActionArea, Divider, Paper, IconButton, Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { fetchComplaints } from '../../redux/slices/complaintSlice';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const CATEGORIES = ['ALL', 'ROAD', 'WATER', 'ELECTRICITY', 'SANITATION', 'PARKS', 'NOISE', 'BUILDING', 'DRAINAGE', 'STREET_LIGHT', 'OTHER'];
const STATUSES = ['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'REJECTED'];
const PRIORITIES = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const statusColors = {
  SUBMITTED: 'default',
  UNDER_REVIEW: 'info',
  ASSIGNED: 'info',
  IN_PROGRESS: 'warning',
  ON_HOLD: 'warning',
  RESOLVED: 'success',
  REJECTED: 'error',
};

const priorityColors = {
  LOW: 'default',
  MEDIUM: 'primary',
  HIGH: 'warning',
  CRITICAL: 'error',
};

const ComplaintList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { complaints, loading, pagination } = useSelector((state) => state.complaints);
  const { user } = useSelector((state) => state.auth);

  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    category: 'ALL',
    priority: 'ALL',
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const params = { page: page - 1, size: 10 };
    if (filters.status !== 'ALL') params.status = filters.status;
    if (filters.category !== 'ALL') params.category = filters.category;
    if (filters.priority !== 'ALL') params.priority = filters.priority;
    if (filters.search) params.search = filters.search;
    dispatch(fetchComplaints(params));
  }, [dispatch, page, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ search: '', status: 'ALL', category: 'ALL', priority: 'ALL' });
    setPage(1);
  };

  const isFiltered = filters.status !== 'ALL' || filters.category !== 'ALL' ||
    filters.priority !== 'ALL' || filters.search !== '';

  const isAdmin = ['ADMIN', 'ROLE_ADMIN', 'OFFICIAL', 'ROLE_OFFICIAL'].includes(user?.role);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>All Complaints</Typography>
          <Typography variant="body2" color="text.secondary">
            {pagination.totalElements} complaints found
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/complaints/create')}
        >
          File Complaint
        </Button>
      </Box>

      {/* Search & Filters */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search complaints..."
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            sx={{ flex: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
              ),
            }}
          />
          <Tooltip title="Toggle Filters">
            <IconButton onClick={() => setShowFilters(!showFilters)} color={showFilters ? 'primary' : 'default'}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
          {isFiltered && (
            <Button size="small" startIcon={<ClearIcon />} onClick={handleClearFilters} color="error">
              Clear
            </Button>
          )}
        </Box>

        {showFilters && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                select fullWidth size="small" label="Status"
                name="status" value={filters.status} onChange={handleFilterChange}
              >
                {STATUSES.map(s => <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select fullWidth size="small" label="Category"
                name="category" value={filters.category} onChange={handleFilterChange}
              >
                {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select fullWidth size="small" label="Priority"
                name="priority" value={filters.priority} onChange={handleFilterChange}
              >
                {PRIORITIES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Complaint Cards */}
      {loading ? (
        <Loader message="Loading complaints..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No Complaints Found"
          message="Try adjusting your filters or file a new complaint."
          action={() => navigate('/complaints/create')}
          actionLabel="File Complaint"
        />
      ) : (
        <Grid container spacing={2}>
          {complaints.map((complaint) => (
            <Grid item xs={12} key={complaint.id}>
              <Card elevation={1} sx={{ borderRadius: 2, '&:hover': { elevation: 4, boxShadow: 3 } }}>
                <CardActionArea onClick={() => navigate(`/complaints/${complaint.id}`)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {complaint.complaintId}
                          </Typography>
                          <Chip label={complaint.categoryName || complaint.category} size="small" variant="outlined" />
                          <Chip
                            label={complaint.priority}
                            size="small"
                            color={priorityColors[complaint.priority] || 'default'}
                          />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          {complaint.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {complaint.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                          <Typography variant="caption" color="text.secondary">
                            📍 {complaint.location || complaint.address || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            👤 {complaint.citizenName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            🗓 {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'N/A'}
                          </Typography>
                          {complaint.upvoteCount > 0 && (
                            <Typography variant="caption" color="primary">
                              👍 {complaint.upvoteCount} upvotes
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <Chip
                          label={complaint.status?.replace('_', ' ')}
                          color={statusColors[complaint.status] || 'default'}
                          size="small"
                        />
                        
                        {/* Show assigned info to everyone if assigned */}
                        {complaint.assignedTo || complaint.assignedToName ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <Avatar sx={{ width: 20, height: 20, fontSize: 10, bgcolor: 'success.main' }}>
                              {(complaint.assignedTo?.name || complaint.assignedToName)?.[0] || 'O'}
                            </Avatar>
                            <Typography variant="caption" color="success.dark" fontWeight={600}>
                              {complaint.assignedTo?.name || complaint.assignedToName}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                            Not assigned
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.totalPages}
            page={page}
            onChange={(_, val) => setPage(val)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
};

export default ComplaintList;
