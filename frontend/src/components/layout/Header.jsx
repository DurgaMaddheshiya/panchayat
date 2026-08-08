import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { logout } from '../../redux/slices/authSlice';
import { fetchUnreadCount, fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../../redux/slices/notificationSlice';

const Header = ({ drawerWidth, onMenuClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount, notifications } = useSelector((state) => state.notifications);

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotif, setAnchorElNotif] = useState(null);

  useEffect(() => {
    dispatch(fetchUnreadCount());
    const interval = setInterval(() => dispatch(fetchUnreadCount()), 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleOpenNotif = (e) => {
    setAnchorElNotif(e.currentTarget);
    dispatch(fetchNotifications({ page: 0, size: 10 }));
  };

  const handleCloseNotif = () => setAnchorElNotif(null);

  const handleMarkRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 2px 10px rgba(102, 126, 234, 0.3)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 2 }}>
          <Typography
            variant="h6"
            noWrap
            sx={{ 
              fontWeight: 700, 
              cursor: 'pointer', 
              letterSpacing: 1,
              transition: 'opacity 0.2s',
              '&:hover': {
                opacity: 0.9
              }
            }}
            onClick={() => navigate('/')}
          >
            🏛️ Panchayat
          </Typography>
        </Box>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton color="inherit" onClick={handleOpenNotif}>
            <Badge badgeContent={unreadCount} sx={{ '& .MuiBadge-badge': { backgroundColor: '#fbbf24', color: '#1f2937' } }}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorElNotif}
          open={Boolean(anchorElNotif)}
          onClose={handleCloseNotif}
          PaperProps={{ sx: { width: 360, maxHeight: 480, borderRadius: 2 } }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight={600}>Notifications</Typography>
            {unreadCount > 0 && (
              <Typography
                variant="caption"
                sx={{ 
                  cursor: 'pointer',
                  color: '#667eea',
                  '&:hover': { textDecoration: 'underline' }
                }}
                onClick={handleMarkAllRead}
              >
                Mark all read
              </Typography>
            )}
          </Box>
          <Divider />
          {notifications.length === 0 ? (
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">No notifications</Typography>
            </MenuItem>
          ) : (
            notifications.slice(0, 8).map((notif) => (
              <MenuItem
                key={notif.id}
                onClick={() => handleMarkRead(notif.id)}
                sx={{ 
                  backgroundColor: notif.isRead ? 'transparent' : '#f3f4f6', 
                  whiteSpace: 'normal',
                  '&:hover': { backgroundColor: notif.isRead ? '#f9fafb' : '#e5e7eb' }
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={notif.isRead ? 400 : 600}>
                    {notif.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notif.message}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
        </Menu>

        {/* User Menu */}
        <Tooltip title="Account">
          <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)} sx={{ ml: 1 }}>
            <Avatar sx={{ 
              width: 34, 
              height: 34, 
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', 
              fontSize: 14,
              fontWeight: 700,
              color: '#1f2937'
            }}>
              {getInitials(user?.name || user?.fullName)}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorElUser}
          open={Boolean(anchorElUser)}
          onClose={() => setAnchorElUser(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>{user?.name || user?.fullName}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { navigate('/dashboard'); setAnchorElUser(null); }}>
            <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
            Dashboard
          </MenuItem>
          <MenuItem onClick={() => { navigate('/profile'); setAnchorElUser(null); }}>
            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
            Profile
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
