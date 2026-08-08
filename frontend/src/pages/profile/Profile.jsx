import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, Avatar,
  Divider, Chip, Paper, LinearProgress, Tab, Tabs,
} from '@mui/material';
import {
  Edit as EditIcon,
  Report as ReportIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as PendingIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { fetchMyComplaints } from '../../redux/slices/complaintSlice';
import { fetchProfile } from '../../redux/slices/authSlice';
import Loader from '../../components/common/Loader';

const roleColors = {
  CITIZEN: 'default', ROLE_CITIZEN: 'default',
  OFFICIAL: 'primary', ROLE_OFFICIAL: 'primary',
  SOCIAL_WORKER: 'success', ROLE_SOCIAL_WORKER: 'success',
  ADMIN: 'error', ROLE_ADMIN: 'error',
};

const statusColors = {
  PENDING: 'warning', IN_PROGRESS: 'info',
  RESOLVED: 'success', CLOSED: 'default', REJECTED: 'error',
};

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { myComplaints, loading: complaintLoading } = useSelector((state) => state.complaints);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchMyComplaints({ page: 0, size: 20 }));
  }, [dispatch]);

  const stats = {
    total: myComplaints.length,
    pending: myComplaints.filter(c => c.status === 'PENDING').length,
    inProgress: myComplaints.filter(c => c.status === 'IN_PROGRESS').length,
    resolved: myComplaints.filter(c => c.status === 'RESOLVED').length,
    rejected: myComplaints.filter(c => c.status === 'REJECTED').length,
  };

  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (authLoading) return <Loader />;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>My Profile</Typography>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                sx={{
                  width: 96, height: 96,
                  bgcolor: 'primary.main',
                  fontSize: 36,
                  mx: 'auto', mb: 2,
                }}
              >
                {getInitials(user?.fullName || user?.name)}
              </Avatar>
              <Typography variant="h6" fontWeight={700}>
                {user?.fullName || user?.name || 'User'}
              </Typography>
              <Chip
                label={user?.role?.replace('ROLE_', '') || 'CITIZEN'}
                color={roleColors[user?.role] || 'default'}
                size="small"
                sx={{ mt: 1, mb: 2 }}
              />
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                fullWidth
                onClick={() => navigate('/profile/edit')}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card elevation={2} sx={{ borderRadius: 2, mt: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Contact Info</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2">{user?.email || 'N/A'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2">{user?.phone || 'Not provided'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon fontSize="small" color="action" />
                  <Typography variant="body2">{user?.address || 'Not provided'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BadgeIcon fontSize="small" color="action" />
                  <Typography variant="body2">Ward: {user?.wardNumber || 'N/A'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    Joined: {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                      : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel */}
        <Grid item xs={12} md={8}>
          {/* Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Total Filed', value: stats.total, color: '#1976d2' },
              { label: 'Pending', value: stats.pending, color: '#ed6c02' },
              { label: 'In Progress', value: stats.inProgress, color: '#0288d1' },
              { label: 'Resolved', value: stats.resolved, color: '#2e7d32' },
            ].map(s => (
              <Grid item xs={6} sm={3} key={s.label}>
                <Paper elevation={1} sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h5" fontWeight={700} color={s.color}>{s.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Resolution rate */}
          {stats.total > 0 && (
            <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" fontWeight={500}>Resolution Rate</Typography>
                <Typography variant="body2" fontWeight={700} color="success.main">{resolutionRate}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={resolutionRate} color="success" sx={{ borderRadius: 1, height: 8 }} />
            </Paper>
          )}

          {/* Recent Complaints */}
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" fontWeight={600}>Recent Complaints</Typography>
                <Button size="small" onClick={() => navigate('/my-complaints')}>View All</Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {complaintLoading ? (
                <Loader />
              ) : myComplaints.length === 0 ? (
                <Box textAlign="center" py={3}>
                  <ReportIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                  <Typography color="text.secondary" mt={1}>No complaints filed yet</Typography>
                  <Button variant="contained" size="small" sx={{ mt: 1 }} onClick={() => navigate('/complaints/create')}>
                    File First Complaint
                  </Button>
                </Box>
              ) : (
                myComplaints.slice(0, 6).map((c) => (
                  <Box
                    key={c.id}
                    onClick={() => navigate(`/complaints/${c.id}`)}
                    sx={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', p: 1.5, mb: 1,
                      border: '1px solid', borderColor: 'divider',
                      borderRadius: 1.5, cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 280 }}>
                        {c.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {c.complaintId} &bull; {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : ''}
                      </Typography>
                    </Box>
                    <Chip
                      label={c.status?.replace('_', ' ')}
                      color={statusColors[c.status] || 'default'}
                      size="small"
                    />
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
