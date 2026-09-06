import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Report as ReportIcon,
  AddCircle as AddIcon,
  ListAlt as ListAltIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Category as CategoryIcon,
  Home as HomeIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const citizenNav = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'All Complaints', icon: <ListAltIcon />, path: '/complaints' },
  { label: 'File Complaint', icon: <AddIcon />, path: '/complaints/create' },
  { label: 'My Complaints', icon: <ReportIcon />, path: '/my-complaints' },
  { label: 'Profile', icon: <PersonIcon />, path: '/profile' },
];

const officialNav = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'All Complaints', icon: <ListAltIcon />, path: '/complaints' },
  { label: 'Assigned to Me', icon: <ReportIcon />, path: '/assigned-complaints' },
  { label: 'Statistics', icon: <BarChartIcon />, path: '/dashboard' },
  { label: 'Profile', icon: <PersonIcon />, path: '/profile' },
];

const adminNav = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'All Complaints', icon: <ListAltIcon />, path: '/complaints' },
  { label: 'Deleted Complaints', icon: <DeleteIcon sx={{ color: 'error.main' }} />, path: '/admin/deleted-complaints' },
  { label: 'Create User', icon: <PeopleIcon />, path: '/admin/create-user' },
  { label: 'Reports', icon: <BarChartIcon />, path: '/reports' },
  { label: 'Profile', icon: <PersonIcon />, path: '/profile' },
];

const roleNavMap = {
  ROLE_CITIZEN: citizenNav,
  CITIZEN: citizenNav,
  ROLE_OFFICIAL: officialNav,
  OFFICIAL: officialNav,
  ROLE_SOCIAL_WORKER: officialNav,
  SOCIAL_WORKER: officialNav,
  ROLE_ADMIN: adminNav,
  ADMIN: adminNav,
};

const roleColors = {
  CITIZEN: { bg: '#e5e7eb', text: '#1f2937' },
  ROLE_CITIZEN: { bg: '#e5e7eb', text: '#1f2937' },
  OFFICIAL: { bg: '#6366f1', text: 'white' },
  ROLE_OFFICIAL: { bg: '#6366f1', text: 'white' },
  SOCIAL_WORKER: { bg: '#10b981', text: 'white' },
  ROLE_SOCIAL_WORKER: { bg: '#10b981', text: 'white' },
  ADMIN: { bg: '#ef4444', text: 'white' },
  ROLE_ADMIN: { bg: '#ef4444', text: 'white' },
};

const Sidebar = ({ drawerWidth, mobileOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const navItems = roleNavMap[user?.role] || citizenNav;

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo area */}
      <Box sx={{ p: 2, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Welcome,
        </Typography>
        <Typography variant="subtitle1" fontWeight={700} textAlign="center">
          {user?.name || user?.fullName || 'User'}
        </Typography>
        <Chip
          label={user?.role?.replace('ROLE_', '') || 'CITIZEN'}
          size="small"
          sx={{ 
            mt: 0.5,
            backgroundColor: roleColors[user?.role]?.bg || '#e5e7eb',
            color: roleColors[user?.role]?.text || '#1f2937',
            fontWeight: 600
          }}
        />
      </Box>
      <Divider />

      {/* Nav items */}
      <List sx={{ flex: 1, pt: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => { navigate(item.path); onClose(); }}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    '& .MuiListItemIcon-root': { color: 'white' },
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a4493 100%)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: isActive ? undefined : '#f3f4f6',
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'white' : '#667eea' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={() => { navigate('/'); onClose(); }}
          sx={{ 
            borderRadius: 2, 
            mb: 1,
            '&:hover': {
              backgroundColor: '#f3f4f6',
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: '#667eea' }}><HomeIcon /></ListItemIcon>
          <ListItemText primary="Home Page" primaryTypographyProps={{ variant: 'body2' }} />
        </ListItemButton>
        <Typography variant="caption" color="text.disabled" align="center" display="block">
          Panchayat v1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
