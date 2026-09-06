import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Grid,
  CircularProgress, Alert, Divider, Avatar, InputAdornment, IconButton,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Visibility, VisibilityOff,
} from '@mui/icons-material';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { fetchProfile } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';

const EditProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [profileData, setProfileData] = useState({
    fullName: '',
    mobile: '',
    address: '',
    wardNumber: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPwd, setShowPwd] = useState({ current: false, new: false });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || user.name || '',
        mobile: user.mobile || user.phone || '',
        address: user.address || '',
        wardNumber: user.wardNumber || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setProfileError('');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordError('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.fullName.trim()) {
      setProfileError('Full name is required');
      return;
    }
    setProfileLoading(true);
    try {
      await api.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, profileData);
      await dispatch(fetchProfile());
      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    }
    setProfileLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      await api.put(API_ENDPOINTS.USERS.CHANGE_PASSWORD, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    }
    setPasswordLoading(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/profile')}>Back</Button>
        <Typography variant="h5" fontWeight={700}>Edit Profile</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Info */}
        <Grid item xs={12} md={7}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 24 }}>
                {getInitials(profileData.fullName)}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>{profileData.fullName}</Typography>
                <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Personal Information</Typography>
            <Box component="form" onSubmit={handleProfileSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required fullWidth label="Full Name" name="fullName"
                    value={profileData.fullName} onChange={handleProfileChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth label="Email Address" value={user?.email || ''} disabled
                    helperText="Email cannot be changed"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Phone Number" name="mobile"
                    value={profileData.mobile} onChange={handleProfileChange}
                    inputProps={{ maxLength: 10 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Ward Number" name="wardNumber" type="number"
                    value={profileData.wardNumber} onChange={handleProfileChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth label="Address" name="address"
                    value={profileData.address} onChange={handleProfileChange}
                    multiline rows={2}
                  />
                </Grid>
              </Grid>

              {profileError && (
                <Alert severity="error" sx={{ mt: 2 }}>{profileError}</Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                startIcon={profileLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                disabled={profileLoading}
                sx={{ mt: 3 }}
              >
                {profileLoading ? 'Saving...' : 'Save Profile'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Change Password */}
        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Change Password</Typography>
            <Divider sx={{ mb: 3 }} />

            <Box component="form" onSubmit={handlePasswordSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required fullWidth
                    label="Current Password" name="currentPassword"
                    type={showPwd.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPwd(p => ({ ...p, current: !p.current }))} edge="end">
                            {showPwd.current ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required fullWidth
                    label="New Password" name="newPassword"
                    type={showPwd.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    helperText="Minimum 6 characters"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPwd(p => ({ ...p, new: !p.new }))} edge="end">
                            {showPwd.new ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required fullWidth
                    label="Confirm New Password" name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </Grid>
              </Grid>

              {passwordError && (
                <Alert severity="error" sx={{ mt: 2 }}>{passwordError}</Alert>
              )}

              <Button
                type="submit"
                variant="outlined"
                color="warning"
                disabled={passwordLoading}
                sx={{ mt: 3 }}
                startIcon={passwordLoading ? <CircularProgress size={16} /> : null}
              >
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EditProfile;
