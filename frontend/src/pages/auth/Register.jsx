import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Box, Paper, TextField, Button, Typography,
  InputAdornment, IconButton, CircularProgress, Grid, Alert,
} from '@mui/material';
import {
  Visibility, VisibilityOff,
  HowToReg as RegisterIcon,
  Home as HomeIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { register } from '../../redux/slices/authSlice';
import EmailVerification from '../../components/auth/EmailVerification';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState('form');
  // verifiedOtp stored for potential retry logic
  const [, setVerifiedOtp] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    address: '',
    wardNumber: '',
  });
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const validate = () => {
    if (!formData.fullName.trim()) return 'Full name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Invalid email address';
    if (!formData.mobile.trim()) return 'Mobile number is required';
    if (!/^[0-9]{10}$/.test(formData.mobile)) return 'Mobile number must be 10 digits';
    if (formData.password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
      return 'Password must contain uppercase, lowercase and a digit (e.g. Test@123)';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    return null;
  };

  // Step 1: Validate form, then go to email verification
  const handleProceedToVerify = (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setStep('verify_email');
  };

  // Step 2: After email verified, submit registration
  const handleEmailVerified = async (otp) => {
    setVerifiedOtp(otp);
    setStep('submitting');

    const { confirmPassword, ...submitData } = formData;
    submitData.otp = otp;
    submitData.role = 'CITIZEN';
    if (submitData.wardNumber) {
      submitData.wardNumber = parseInt(submitData.wardNumber, 10);
    } else {
      delete submitData.wardNumber;
    }

    const result = await dispatch(register(submitData));
    if (result.type === 'auth/register/fulfilled') {
      navigate('/dashboard');
    } else {
      setStep('form');
      setFormError(result.payload || 'Registration failed. Please try again.');
    }
  };

  // Shared input style
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused fieldset': { borderColor: '#667eea' },
    },
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

        {/* Email Verification Step */}
        {step === 'verify_email' && (
          <EmailVerification
            email={formData.email}
            fullName={formData.fullName}
            onVerified={handleEmailVerified}
            onBack={() => setStep('form')}
            initialStep="send"
          />
        )}

        {/* Submitting Step */}
        {step === 'submitting' && (
          <Paper elevation={10} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6">Creating your account...</Typography>
          </Paper>
        )}

        {/* Registration Form */}
        {step === 'form' && (
          <Paper elevation={10} sx={{ p: 4, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 70, height: 70, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mb: 2, boxShadow: '0 8px 16px rgba(102,126,234,0.3)',
                }}
              >
                <RegisterIcon sx={{ fontSize: 36, color: 'white' }} />
              </Box>
              <Typography
                component="h1" variant="h4" fontWeight={800}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Join Panchayat
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your account and start reporting civic issues
              </Typography>
            </Box>

            {/* Email verification info banner */}
            <Alert severity="info" icon={<CheckIcon />} sx={{ mb: 2 }}>
              Your email will be verified via OTP before account creation
            </Alert>

            <Box component="form" onSubmit={handleProceedToVerify}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required fullWidth label="Full Name" name="fullName"
                    value={formData.fullName} onChange={handleChange}
                    autoFocus sx={inputSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required fullWidth label="Email Address" name="email"
                    type="email" value={formData.email} onChange={handleChange}
                    sx={inputSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required fullWidth label="Mobile Number" name="mobile"
                    value={formData.mobile} onChange={handleChange}
                    inputProps={{ maxLength: 10 }} helperText="10 digit number"
                    sx={inputSx}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth label="Address" name="address"
                    value={formData.address} onChange={handleChange}
                    sx={inputSx}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth label="Ward Number" name="wardNumber" type="number"
                    value={formData.wardNumber} onChange={handleChange}
                    sx={inputSx}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required fullWidth label="Password" name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password} onChange={handleChange}
                    helperText="Min 8 chars: uppercase, lowercase & digit"
                    sx={inputSx}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required fullWidth label="Confirm Password"
                    name="confirmPassword" type="password"
                    value={formData.confirmPassword} onChange={handleChange}
                    sx={inputSx}
                  />
                </Grid>
              </Grid>

              {(formError || error) && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {formError || error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth variant="contained" size="large"
                sx={{
                  mt: 3, mb: 2, py: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontWeight: 600, fontSize: '1rem',
                  boxShadow: '0 4px 14px rgba(102,126,234,0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a4493 100%)',
                    boxShadow: '0 6px 20px rgba(102,126,234,0.5)',
                  },
                }}
                disabled={loading}
              >
                Continue to Email Verification →
              </Button>

              <Box textAlign="center">
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Typography
                    variant="body2"
                    sx={{ color: '#667eea', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
                  >
                    Already have an account? Sign in
                  </Typography>
                </Link>
              </Box>
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default Register;
