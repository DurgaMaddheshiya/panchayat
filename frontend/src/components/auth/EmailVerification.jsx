import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Alert,
  CircularProgress, InputAdornment, Chip, Stack
} from '@mui/material';
import {
  Email as EmailIcon,
  Verified as VerifiedIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import api from '../../services/api';

const EmailVerification = ({ 
  email, 
  fullName, 
  onVerified, 
  onBack,
  initialStep = 'send' // 'send' or 'verify'
}) => {
  const [step, setStep] = useState(initialStep);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/send-otp', { email, fullName });
      setSuccess('OTP sent successfully! Please check your email.');
      setStep('verify');
      setCountdown(120); // 2 minutes cooldown
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/verify-otp', { email, otp });
      setSuccess('Email verified successfully!');
      setTimeout(() => onVerified(otp), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    }
    setLoading(false);
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 6) {
      setOtp(value);
      setError('');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 450, mx: 'auto', borderRadius: 2 }}>
      <Box textAlign="center" mb={3}>
        <EmailIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Email Verification
        </Typography>
        <Typography variant="body2" color="text.secondary">
          We need to verify your email address before creating your account
        </Typography>
      </Box>

      {/* Email Display */}
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: 'grey.50', 
          borderRadius: 1, 
          border: '1px solid', 
          borderColor: 'grey.200',
          mb: 3 
        }}
      >
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Verifying email:
        </Typography>
        <Typography variant="body1" fontWeight={600}>
          {email}
        </Typography>
      </Box>

      {step === 'send' && (
        <Box>
          <Typography variant="body2" color="text.secondary" mb={3} textAlign="center">
            Click the button below to receive a 6-digit verification code at your email address.
          </Typography>
          
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={sendOtp}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <EmailIcon />}
            sx={{ mb: 2 }}
          >
            {loading ? 'Sending OTP...' : 'Send Verification Code'}
          </Button>
        </Box>
      )}

      {step === 'verify' && (
        <Box>
          <Typography variant="body2" color="text.secondary" mb={2} textAlign="center">
            Enter the 6-digit code sent to your email
          </Typography>

          <TextField
            fullWidth
            label="Verification Code"
            value={otp}
            onChange={handleOtpChange}
            placeholder="000000"
            inputProps={{ 
              maxLength: 6,
              style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }
            }}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {otp.length === 6 && <VerifiedIcon color="success" />}
                </InputAdornment>
              )
            }}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={verifyOtp}
            disabled={loading || otp.length !== 6}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <VerifiedIcon />}
            sx={{ mb: 2 }}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </Button>

          {/* Resend Option */}
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" mb={2}>
            <Typography variant="body2" color="text.secondary">
              Didn't receive the code?
            </Typography>
            <Button
              variant="text"
              size="small"
              onClick={sendOtp}
              disabled={countdown > 0 || loading}
            >
              {countdown > 0 ? (
                <Chip 
                  icon={<TimerIcon />}
                  label={`Resend in ${countdown}s`} 
                  size="small" 
                  variant="outlined"
                />
              ) : (
                'Resend'
              )}
            </Button>
          </Stack>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Button
        fullWidth
        variant="outlined"
        onClick={onBack}
        disabled={loading}
      >
        Back to Registration
      </Button>
    </Paper>
  );
};

export default EmailVerification;