import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Avatar,
  Paper,
} from '@mui/material';
import {
  AddCircle as AddIcon,
  Report as ReportIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as PendingIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { fetchMyComplaints } from '../../redux/slices/complaintSlice';
import { fetchCitizenDashboard } from '../../redux/slices/dashboardSlice';
import Loader from '../../components/common/Loader';

const statusColors = {
  SUBMITTED: 'default',
  UNDER_REVIEW: 'info',
  ASSIGNED: 'info',
  IN_PROGRESS: 'warning',
  ON_HOLD: 'warning',
  RESOLVED: 'success',
  REJECTED: 'error',
};

const CitizenDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { myComplaints, loading } = useSelector((state) => state.complaints);
  // eslint-disable-next-line no-unused-vars
  const { citizenStats, loading: dashboardLoading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchMyComplaints({ page: 0, size: 5 }));
    if (user?.id) {
      dispatch(fetchCitizenDashboard(user.id));
    }
  }, [dispatch, user?.id]);

  // Calculate user stats from their complaints
  const myStats = {
    total: myComplaints.length,
    pending: myComplaints.filter(c => ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED'].includes(c.status)).length,
    inProgress: myComplaints.filter(c => ['IN_PROGRESS', 'ON_HOLD'].includes(c.status)).length,
    resolved: myComplaints.filter(c => c.status === 'RESOLVED').length,
  };

  // Calculate user-specific resolution rate
  const userResolutionRate = myStats.total > 0 ? Math.round((myStats.resolved / myStats.total) * 100) : 0;

  const statCards = [
    { label: 'Total Filed', value: myStats.total, icon: <ReportIcon />, color: '#1976d2', bg: '#e3f2fd' },
    { label: 'Pending', value: myStats.pending, icon: <PendingIcon />, color: '#ed6c02', bg: '#fff3e0' },
    { label: 'In Progress', value: myStats.inProgress, icon: <TrendingIcon />, color: '#0288d1', bg: '#e1f5fe' },
    { label: 'Resolved', value: myStats.resolved, icon: <CheckIcon />, color: '#2e7d32', bg: '#e8f5e9' },
  ];

  return (
    <Box>
      {/* Welcome Banner */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #2e7d32, #1976d2)',
          color: 'white',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Welcome back, {user?.fullName || user?.name || 'Citizen'}! 👋
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
              Together we make our city better. Keep reporting, keep improving.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="warning"
            startIcon={<AddIcon />}
            size="large"
            onClick={() => navigate('/complaints/create')}
            sx={{ fontWeight: 700 }}
          >
            File New Complaint
          </Button>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {card.label}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color={card.color}>
                      {card.value}
                    </Typography>
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

      {/* Recent Complaints */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>My Recent Complaints</Typography>
                <Button size="small" onClick={() => navigate('/my-complaints')}>
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {loading ? (
                <Loader message="Loading complaints..." />
              ) : myComplaints.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <ReportIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    No complaints filed yet
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/complaints/create')}
                  >
                    File First Complaint
                  </Button>
                </Box>
              ) : (
                myComplaints.slice(0, 5).map((complaint) => (
                  <Box
                    key={complaint.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' },
                    }}
                    onClick={() => navigate(`/complaints/${complaint.id}`)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600} noWrap>
                          {complaint.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {complaint.complaintId} &bull; {complaint.categoryName}
                        </Typography>
                      </Box>
                      <Chip
                        label={complaint.status?.replace('_', ' ')}
                        color={statusColors[complaint.status] || 'default'}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ borderRadius: 2, mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/complaints/create')}
                >
                  File New Complaint
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ReportIcon />}
                  onClick={() => navigate('/my-complaints')}
                >
                  My Complaints
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<TrendingIcon />}
                  onClick={() => navigate('/complaints')}
                >
                  Browse All Issues
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* My Personal Stats */}
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                My Stats
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">My Resolution Rate</Typography>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      {userResolutionRate}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={userResolutionRate}
                    color="success"
                    sx={{ mt: 0.5, borderRadius: 1 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">My Total Complaints</Typography>
                  <Typography variant="body2" fontWeight={600}>{myStats.total}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Currently Pending</Typography>
                  <Typography variant="body2" fontWeight={600} color="warning.main">
                    {myStats.pending}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Successfully Resolved</Typography>
                  <Typography variant="body2" fontWeight={600} color="success.main">
                    {myStats.resolved}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CitizenDashboard;
