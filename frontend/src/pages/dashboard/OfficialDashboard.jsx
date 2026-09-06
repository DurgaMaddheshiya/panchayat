import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Divider, Avatar, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, LinearProgress, Alert, CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  HourglassEmpty as PendingIcon,
  TrendingUp as TrendingIcon,
  ListAlt as ListIcon,
  Assignment as AssignIcon,
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

const OfficialDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [assignedComplaints, setAssignedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssignedComplaints();
  }, []);

  const fetchAssignedComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/complaints/assigned-to-me?size=10&sort=createdAt,desc');
      const data = res.data?.data || res.data;
      setAssignedComplaints(data?.content || []);
    } catch (err) {
      setError('Failed to load assigned complaints');
    } finally {
      setLoading(false);
    }
  };

  // Compute stats from assigned complaints
  const myStats = {
    total: assignedComplaints.length,
    pending: assignedComplaints.filter(c => ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED'].includes(c.status)).length,
    inProgress: assignedComplaints.filter(c => ['IN_PROGRESS', 'ON_HOLD'].includes(c.status)).length,
    resolved: assignedComplaints.filter(c => c.status === 'RESOLVED').length,
    urgent: assignedComplaints.filter(c => ['HIGH', 'URGENT'].includes(c.priority)).length,
  };

  const resolutionRate = myStats.total > 0
    ? Math.round((myStats.resolved / myStats.total) * 100)
    : 0;

  const statCards = [
    { label: 'Assigned to Me', value: myStats.total, icon: <ListIcon />, color: '#1976d2', bg: '#e3f2fd' },
    { label: 'Pending Action', value: myStats.pending, icon: <PendingIcon />, color: '#ed6c02', bg: '#fff3e0' },
    { label: 'In Progress', value: myStats.inProgress, icon: <TrendingIcon />, color: '#0288d1', bg: '#e1f5fe' },
    { label: 'Resolved', value: myStats.resolved, icon: <CheckIcon />, color: '#2e7d32', bg: '#e8f5e9' },
  ];

  return (
    <Box>
      {/* Welcome Banner */}
      <Paper
        sx={{
          p: 3, mb: 3,
          background: 'linear-gradient(135deg, #1565c0, #0288d1)',
          color: 'white', borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Welcome, {user?.fullName || 'Official'}! 👮
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
              You have <strong>{myStats.pending}</strong> pending complaints waiting for your action.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="warning"
            startIcon={<AssignIcon />}
            onClick={() => navigate('/assigned-complaints')}
            sx={{ fontWeight: 700 }}
          >
            View All Assigned
          </Button>
        </Box>
      </Paper>

      {/* Urgent Alert */}
      {myStats.urgent > 0 && (
        <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 3 }}>
          <strong>{myStats.urgent} urgent/high priority complaints</strong> need immediate attention!
          <Button size="small" sx={{ ml: 2 }} onClick={() => navigate('/assigned-complaints')}>
            View Now
          </Button>
        </Alert>
      )}

      {/* Stat Cards */}
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
        {/* Assigned Complaints Table */}
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>My Assigned Complaints</Typography>
                <Button size="small" onClick={() => navigate('/assigned-complaints')}>View All</Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {loading ? (
                <Box textAlign="center" py={4}>
                  <CircularProgress size={32} />
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : assignedComplaints.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <AssignIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.secondary">
                    No complaints assigned to you yet.
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Admin will assign complaints to you.
                  </Typography>
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell><strong>ID</strong></TableCell>
                      <TableCell><strong>Title</strong></TableCell>
                      <TableCell><strong>Priority</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Filed On</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignedComplaints.slice(0, 8).map((c) => (
                      <TableRow
                        key={c.id} hover sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/complaints/${c.id}`)}
                      >
                        <TableCell>
                          <Typography variant="caption" fontWeight={700} color="primary">
                            {c.complaintId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>{c.title}</Typography>
                          <Typography variant="caption" color="text.secondary">{c.citizenName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={c.priority} size="small"
                            color={c.priority === 'HIGH' || c.priority === 'URGENT' ? 'error' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={c.status?.replace(/_/g, ' ')}
                            color={statusColors[c.status] || 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Performance Card */}
          <Card elevation={2} sx={{ borderRadius: 2, mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>My Performance</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Resolution Rate</Typography>
                    <Typography variant="body2" fontWeight={700} color="success.main">
                      {resolutionRate}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate" value={resolutionRate}
                    color="success" sx={{ borderRadius: 1, height: 8 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Total Assigned</Typography>
                  <Typography variant="body2" fontWeight={600}>{myStats.total}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Resolved</Typography>
                  <Typography variant="body2" fontWeight={600} color="success.main">{myStats.resolved}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Pending</Typography>
                  <Typography variant="body2" fontWeight={600} color="warning.main">{myStats.pending}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Urgent/High</Typography>
                  <Typography variant="body2" fontWeight={600} color="error.main">{myStats.urgent}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Quick Actions</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="contained" fullWidth startIcon={<AssignIcon />}
                  onClick={() => navigate('/assigned-complaints')}
                >
                  My Assigned Complaints
                </Button>
                <Button
                  variant="outlined" fullWidth startIcon={<ListIcon />}
                  onClick={() => navigate('/complaints')}
                >
                  Browse All Complaints
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OfficialDashboard;
