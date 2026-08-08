import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Divider, Avatar, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, LinearProgress,
} from '@mui/material';
import {
  Assignment as AssignIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as PendingIcon,
  TrendingUp as TrendingIcon,
  ListAlt as ListIcon,
} from '@mui/icons-material';
import { fetchComplaints } from '../../redux/slices/complaintSlice';
import { fetchDashboardStats } from '../../redux/slices/dashboardSlice';
import Loader from '../../components/common/Loader';

const statusColors = {
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  RESOLVED: 'success',
  CLOSED: 'default',
  REJECTED: 'error',
};

const OfficialDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { complaints, loading } = useSelector((state) => state.complaints);
  const { stats } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchComplaints({ page: 0, size: 10, status: 'PENDING' }));
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const statCards = [
    { label: 'Total Complaints', value: stats?.totalComplaints || 0, icon: <ListIcon />, color: '#1976d2', bg: '#e3f2fd' },
    { label: 'Pending', value: stats?.pendingComplaints || 0, icon: <PendingIcon />, color: '#ed6c02', bg: '#fff3e0' },
    { label: 'In Progress', value: stats?.inProgressComplaints || 0, icon: <TrendingIcon />, color: '#0288d1', bg: '#e1f5fe' },
    { label: 'Resolved', value: stats?.resolvedComplaints || 0, icon: <CheckIcon />, color: '#2e7d32', bg: '#e8f5e9' },
  ];

  return (
    <Box>
      <Paper
        sx={{
          p: 3, mb: 3,
          background: 'linear-gradient(135deg, #1565c0, #0288d1)',
          color: 'white', borderRadius: 2,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Official Dashboard 👮
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
          Welcome, {user?.fullName || 'Official'}. Manage and resolve citizen complaints efficiently.
        </Typography>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>{card.label}</Typography>
                    <Typography variant="h4" fontWeight={700} color={card.color}>{card.value}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: card.bg, color: card.color, width: 52, height: 52 }}>
                    {card.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>Pending Complaints</Typography>
                <Button size="small" onClick={() => navigate('/complaints')}>View All</Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {loading ? <Loader /> : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {complaints.slice(0, 8).map((c) => (
                      <TableRow
                        key={c.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/complaints/${c.id}`)}
                      >
                        <TableCell>
                          <Typography variant="caption" fontWeight={600}>{c.complaintId}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>{c.title}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{c.categoryName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={c.priority}
                            size="small"
                            color={c.priority === 'HIGH' || c.priority === 'URGENT' ? 'error' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={c.status?.replace('_', ' ')}
                            color={statusColors[c.status] || 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {complaints.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary" py={2}>No complaints found</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Performance</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Resolution Rate</Typography>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      {stats?.resolutionRate || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={stats?.resolutionRate || 0} color="success" sx={{ mt: 0.5, borderRadius: 1 }} />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Avg Response (hrs)</Typography>
                    <Typography variant="body2" fontWeight={600}>{stats?.avgResponseTime || 'N/A'}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Resolved Today</Typography>
                  <Typography variant="body2" fontWeight={600} color="success.main">{stats?.resolvedToday || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">High Priority</Typography>
                  <Typography variant="body2" fontWeight={600} color="error.main">{stats?.highPriorityCount || 0}</Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 3 }}
                onClick={() => navigate('/complaints')}
              >
                Manage Complaints
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OfficialDashboard;
