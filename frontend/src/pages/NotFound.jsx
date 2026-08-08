import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import { Home as HomeIcon, ArrowBack as BackIcon } from '@mui/icons-material';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '80vh', textAlign: 'center', gap: 2,
        }}
      >
        <Typography variant="h1" fontWeight={800} color="primary.main" sx={{ fontSize: '8rem', lineHeight: 1 }}>
          404
        </Typography>
        <Typography variant="h5" fontWeight={600}>Page Not Found</Typography>
        <Typography variant="body1" color="text.secondary">
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button variant="outlined" startIcon={<BackIcon />} onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button variant="contained" startIcon={<HomeIcon />} onClick={() => navigate('/dashboard')}>
            Go Home
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFound;
