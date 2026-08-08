import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        mt: 'auto',
        backgroundColor: 'primary.dark',
        color: 'white',
        textAlign: 'center',
      }}
    >
      <Typography variant="body2">
        © {new Date().getFullYear()} Panchayat — Smart Grievance Management System
      </Typography>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        Report civic issues &bull; Track progress &bull; Get resolutions
      </Typography>
    </Box>
  );
};

export default Footer;
