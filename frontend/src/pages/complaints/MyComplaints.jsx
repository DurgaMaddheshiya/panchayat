import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Chip, Card, CardContent,
  CardActionArea, Pagination, Tabs, Tab, Grid,
  LinearProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { fetchMyComplaints } from '../../redux/slices/complaintSlice';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const statusColors = {
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  RESOLVED: 'success',
  CLOSED: 'default',
  REJECTED: 'error',
};

const TABS = ['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const MyComplaints = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myComplaints, loading, pagination } = useSelector((state) => state.complaints);

  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    dispatch(fetchMyComplaints({ page: page - 1, size: 10 }));
  }, [dispatch, page]);

  const filtered = activeTab === 0
    ? myComplaints
    : myComplaints.filter(c => c.status === TABS[activeTab]);

  const stats = {
    total: myComplaints.length,
    pending: myComplaints.filter(c => c.status === 'PENDING').length,
    inProgress: myComplaints.filter(c => c.status === 'IN_PROGRESS').length,
    resolved: myComplaints.filter(c => c.status === 'RESOLVED').length,
  };

  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>My Complaints</Typography>
          <Typography variant="body2" color="text.secondary">
            Track all your filed complaints
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/complaints/create')}>
          File New
        </Button>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total', value: stats.total, color: '#1976d2' },
          { label: 'Pending', value: stats.pending, color: '#ed6c02' },
          { label: 'In Progress', value: stats.inProgress, color: '#0288d1' },
          { label: 'Resolved', value: stats.resolved, color: '#2e7d32' },
        ].map(s => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card elevation={1} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="h5" fontWeight={700} color={s.color}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Resolution progress */}
      {stats.total > 0 && (
        <Card elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Resolution Rate</Typography>
              <Typography variant="body2" fontWeight={600} color="success.main">{resolutionRate}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={resolutionRate} color="success" sx={{ borderRadius: 1 }} />
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        variant="scrollable"
        scrollButtons="auto"
      >
        {TABS.map((tab, i) => (
          <Tab
            key={tab}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {tab.replace('_', ' ')}
                {i === 0 && <Chip label={stats.total} size="small" sx={{ height: 18, fontSize: 11 }} />}
                {i === 1 && stats.pending > 0 && <Chip label={stats.pending} size="small" color="warning" sx={{ height: 18, fontSize: 11 }} />}
              </Box>
            }
          />
        ))}
      </Tabs>

      {/* Complaints list */}
      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Complaints Found"
          message="You haven't filed any complaints yet."
          action={() => navigate('/complaints/create')}
          actionLabel="File Your First Complaint"
        />
      ) : (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filtered.map((complaint) => (
              <Card key={complaint.id} elevation={1} sx={{ borderRadius: 2 }}>
                <CardActionArea onClick={() => navigate(`/complaints/${complaint.id}`)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {complaint.complaintId}
                          </Typography>
                          <Chip label={complaint.categoryName || complaint.category} size="small" variant="outlined" />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={600}>{complaint.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }} noWrap>
                          📍 {complaint.address || complaint.location || 'Location N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          Filed: {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                        </Typography>
                        
                        {/* Assignment Status */}
                        {complaint.assignedTo || complaint.assignedToName ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, p: 1, bgcolor: 'success.50', borderRadius: 1 }}>
                            <Avatar sx={{ width: 20, height: 20, fontSize: 10, bgcolor: 'success.main' }}>
                              {(complaint.assignedTo?.name || complaint.assignedToName)?.[0] || 'O'}
                            </Avatar>
                            <Typography variant="caption" color="success.dark" fontWeight={600}>
                              Assigned to: {complaint.assignedTo?.name || complaint.assignedToName}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.disabled" sx={{ mt: 1, fontStyle: 'italic', display: 'block' }}>
                            ⏳ Waiting for assignment
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ ml: 2 }}>
                        <Chip
                          label={complaint.status?.replace('_', ' ')}
                          color={statusColors[complaint.status] || 'default'}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={pagination.totalPages} page={page}
                onChange={(_, v) => setPage(v)} color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default MyComplaints;
