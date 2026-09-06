import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Box, Paper, TextField, Button, Typography,
  InputAdornment, IconButton, CircularProgress, Alert, Stepper,
  Step, StepLabel,
} from '@mui/material';
import {
  Home as HomeIcon,
  Email as EmailIcon,
  LockReset as LockResetIcon,
  Visibility, VisibilityOff,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import api from '../../services/api';

const steps = ['Enter Email', 'Verify OTP', 'New Password'];

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSuccess('OTP sent! Please check your email inbox.');
      setActiveStep(1);
      setCountdown(120);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    }
    setLoading(false);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/verify-otp', { email, otp });
      setSuccess('OTP verified! Now set your new password.');
      setActiveStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    }
    setLoading(false);
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setError('Password must contain uppercase, lowercase and a digit (e.g. Test@123)');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/reset-password', { email, otp, newPassword });
      setSuccess('Password reset successfully!');
      setActiveStep(3); // Done step
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    }
    setLoading(false);
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSuccess('New OTP sent to your email!');
      setCountdown(120);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    }
    setLoading(false);
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#667eea' } },
    '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container component="main" maxWidth="sm">
        {/* Home Button */}
        <Box sx={{ mb: 2 }}>
          <Button
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
          >
            Back to Home
          </Button>
        </Box>

        <Paper elevation={10} sx={{ p: 4, borderRadius: 3 }}>
          {/* Header */}
          <Box textAlign="center" mb={3}>
            <Box
              sx={{
                width: 70, height: 70, borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 2,
                boxShadow: '0 8px 16px rgba(102,126,234,0.3)',
              }}
            >
              <LockResetIcon sx={{ fontSize: 36, color: 'white' }} />
            </Box>
            <Typography
              variant="h4" fontWeight={800}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}
            >
              Forgot Password
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Reset your password in 3 easy steps
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Alerts */}
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {/* ── Step 1: Enter Email ── */}
          {activeStep === 0 && (
            <Box component="form" onSubmit={handleSendOtp}>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Enter your registered email address. We'll send you a 6-digit OTP.
              </Typography>
              <TextField
                fullWidth required label="Email Address" type="email"
                value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                sx={inputSx} autoFocus
                InputProps={{
                  startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment>
                }}
              />
              <Button
                type="submit" fullWidth variant="contained" size="large"
                disabled={loading}
                sx={{
                  mt: 3, py: 1.5, fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #6a4493 100%)' },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Send OTP'}
              </Button>
            </Box>
          )}

          {/* ── Step 2: Verify OTP ── */}
          {activeStep === 1 && (
            <Box component="form" onSubmit={handleVerifyOtp}>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Enter the 6-digit OTP sent to <strong>{email}</strong>
              </Typography>
              <TextField
                fullWidth required label="6-Digit OTP"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 6) { setOtp(val); setError(''); }
                }}
                inputProps={{
                  maxLength: 6,
                  style: { textAlign: 'center', fontSize: '1.8rem', letterSpacing: '0.8rem', fontWeight: 700 }
                }}
                sx={inputSx}
                autoFocus
              />
              <Button
                type="submit" fullWidth variant="contained" size="large"
                disabled={loading || otp.length !== 6}
                sx={{
                  mt: 3, py: 1.5, fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #6a4493 100%)' },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Verify OTP'}
              </Button>

              {/* Resend */}
              <Box textAlign="center" mt={2}>
                <Typography variant="body2" color="text.secondary" display="inline">
                  Didn't receive it?{' '}
                </Typography>
                <Button
                  variant="text" size="small"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || loading}
                  sx={{ color: '#667eea', fontWeight: 600 }}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </Button>
              </Box>
            </Box>
          )}

          {/* ── Step 3: New Password ── */}
          {activeStep === 2 && (
            <Box component="form" onSubmit={handleResetPassword}>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Create a strong new password for your account.
              </Typography>
              <TextField
                fullWidth required label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                helperText="Min 8 chars: uppercase, lowercase & digit"
                sx={{ ...inputSx, mb: 2 }}
                autoFocus
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                fullWidth required label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                sx={inputSx}
              />
              <Button
                type="submit" fullWidth variant="contained" size="large"
                disabled={loading}
                sx={{
                  mt: 3, py: 1.5, fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #6a4493 100%)' },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Reset Password'}
              </Button>
            </Box>
          )}

          {/* ── Step 4: Success ── */}
          {activeStep === 3 && (
            <Box textAlign="center" py={2}>
              <CheckIcon sx={{ fontSize: 72, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" fontWeight={700} color="success.main" gutterBottom>
                Password Reset Successful!
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Your password has been updated. You can now login with your new password.
              </Typography>
              <Button
                fullWidth variant="contained" size="large"
                onClick={() => navigate('/login')}
                sx={{
                  py: 1.5, fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Go to Login
              </Button>
            </Box>
          )}

          {/* Login link */}
          {activeStep < 3 && (
            <Box textAlign="center" mt={3}>
              <Typography variant="body2" color="text.secondary" display="inline">
                Remember your password?{' '}
              </Typography>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" display="inline"
                  sx={{ color: '#667eea', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                >
                  Sign In
                </Typography>
              </Link>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
