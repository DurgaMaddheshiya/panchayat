import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Grid,
  MenuItem, CircularProgress, Alert, Divider,
} from '@mui/material';
import { ArrowBack as BackIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import api from '../../services/api';

const ROLES = [
  { value: 'CITIZEN', label: 'Citizen' },
  { value: 'OFFICIAL', label: 'Official (Government)' },
  { value: 'SOCIAL_WORKER', label: 'Social Worker / NGO' },
  { value: 'ADMIN', label: 'Admin' },
];

const CreateUser = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: 'Welcome@123',
    role: 'OFFICIAL',
    address: '',
    village: '',
    district: '',
    state: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Redirect if not admin
  if (user?.role !== 'ADMIN' && user?.role !== 'ROLE_ADMIN') {
    navigate('/dashboard');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.mobile) {
      setError('Full name, email and mobile are required');
      return;
    }
    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      setError('Mobile must be 10 digits');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/admin/create-user', formData);
      setSuccess(
        `User created! Email: ${res.data.data.email}, Role: ${res.data.data.role}. Default password: ${formData.password}`
      );
      setFormData({ ...formData, fullName: '', email: '', mobile: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
    setLoading(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)}>Back</Button>
        <Typography variant="h5" fontWeight={700}>Create User Account</Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 4, maxWidth: 700, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <PersonAddIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>New User Details</Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required fullWidth label="Full Name"
                name="fullName" value={formData.fullName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required fullWidth label="Email"
                name="email" type="email"
                value={formData.email} onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required fullWidth label="Mobile (10 digits)"
                name="mobile" value={formData.mobile}
                onChange={handleChange} inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth select label="Role"
                name="role" value={formData.role}
                onChange={handleChange}
              >
                {ROLES.map(r => (
                  <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Default Password"
                name="password" value={formData.password}
                onChange={handleChange}
                helperText="User should change on first login"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Village / Area"
                name="village" value={formData.village}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="District"
                name="district" value={formData.district}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="State"
                name="state" value={formData.state}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth label="Address"
                name="address" value={formData.address}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <Button
            type="submit"
            fullWidth variant="contained"
            size="large" sx={{ mt: 3 }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PersonAddIcon />}
          >
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </Box>
      </Paper>

      <Paper elevation={1} sx={{ p: 2, mt: 3, maxWidth: 700, bgcolor: 'info.50', borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>Admin Note:</Typography>
        <Typography variant="body2" color="text.secondary">
          • Only you (Admin) can create OFFICIAL, SOCIAL_WORKER and ADMIN accounts.<br />
          • Public registration is restricted to CITIZEN role only.<br />
          • Share the email and default password with the new user and ask them to change it on first login.
        </Typography>
      </Paper>
    </Box>
  );
};

export default CreateUser;
