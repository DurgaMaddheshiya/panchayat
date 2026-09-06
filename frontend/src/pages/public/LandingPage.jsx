import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Chip,
  CircularProgress,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  IconButton,
  Fade,
  Paper,
} from '@mui/material';
import {
  Report as ReportIcon,
  TrackChanges as TrackIcon,
  CheckCircle as CheckIcon,
  People as PeopleIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  HowToReg as RegisterIcon,
  TrendingUp as TrendingIcon,
  VerifiedUser as VerifiedIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';

const features = [
  {
    icon: <ReportIcon sx={{ fontSize: 56, color: '#667eea' }} />,
    title: '📝 शिकायत दर्ज करो',
    desc: 'फोटो खींचो, लोकेशन भेजो, पूरी बात लिखो। बस 2 मिनट में तुम्हारी आवाज़ सरपंच तक पहुँच जाएगी!',
  },
  {
    icon: <TrackIcon sx={{ fontSize: 56, color: '#10b981' }} />,
    title: '👀 लाइव ट्रैकिंग',
    desc: 'अब ना कोई बहाना, ना कोई झूठ! तुम्हारी शिकायत कहाँ तक पहुंची, सब दिखेगा लाइव स्टेटस में।',
  },
  {
    icon: <CheckIcon sx={{ fontSize: 56, color: '#f59e0b' }} />,
    title: '⚡ फटाफट समाधान',
    desc: 'जितनी ज़रूरी शिकायत, उतनी तेज़ कार्रवाई! अब फालतू इंतज़ार नहीं, काम होगा टाइम पे।',
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 56, color: '#6366f1' }} />,
    title: '🤝 मिलकर करो आवाज़',
    desc: 'तुम्हारी पड़ोस वाली भी परेशान है? उसकी शिकायत को वोट दो! जितने ज़्यादा वोट, उतनी तेज़ सुनवाई।',
  },
  {
    icon: <SpeedIcon sx={{ fontSize: 56, color: '#ef4444' }} />,
    title: '🎯 स्मार्ट प्राथमिकता',
    desc: 'बड़ी समस्या को पहले प्राथमिकता! अब हर शिकायत को उसकी अहमियत के हिसाब से संभाला जाएगा।',
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 56, color: '#764ba2' }} />,
    title: '🔒 सुरक्षित और पारदर्शी',
    desc: 'सब कुछ रिकॉर्ड! कोई धांधली नहीं। पूरी प्रक्रिया पारदर्शी और सुरक्षित है। भरोसा करो!',
  },
];

const stats = [
  { number: '10,000+', label: 'Complaints Resolved' },
  { number: '50,000+', label: 'Citizens Registered' },
  { number: '95%', label: 'Resolution Rate' },
  { number: '48 hrs', label: 'Avg. Response Time' },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  // stats fetched from API and stored in state
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchPublicStats();
  }, []);

  const fetchPublicStats = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/public/stats`);
      const data = response.data.data;
      
      // Format stats for display
      const formattedStats = [
        { 
          number: data.totalComplaints?.toLocaleString() || '0', 
          label: 'Total Complaints',
          icon: <ReportIcon sx={{ fontSize: 40, color: 'white', opacity: 0.9 }} />
        },
        { 
          number: data.resolvedComplaints?.toLocaleString() || '0', 
          label: 'Resolved',
          icon: <CheckIcon sx={{ fontSize: 40, color: 'white', opacity: 0.9 }} />
        },
        { 
          number: data.resolutionRate ? `${data.resolutionRate}%` : '0%', 
          label: 'Success Rate',
          icon: <TrendingIcon sx={{ fontSize: 40, color: 'white', opacity: 0.9 }} />
        },
        { 
          number: data.avgResponseTime || 'N/A', 
          label: 'Avg. Response',
          icon: <TimeIcon sx={{ fontSize: 40, color: 'white', opacity: 0.9 }} />
        },
      ];
      
      setStats(formattedStats);
    } catch (error) {
      console.error('Failed to fetch public stats:', error);
      // Fallback to default stats if API fails
      setStats([
        { number: '0', label: 'Total Complaints', icon: <ReportIcon sx={{ fontSize: 40, color: 'white', opacity: 0.9 }} /> },
        { number: '0', label: 'Resolved', icon: <CheckIcon sx={{ fontSize: 40, color: 'white', opacity: 0.9 }} /> },
        { number: '0%', label: 'Success Rate', icon: <TrendingIcon sx={{ fontSize: 40, color: 'white', opacity: 0.9 }} /> },
        { number: 'N/A', label: 'Avg. Response', icon: <TimeIcon sx={{ fontSize: 40, color: 'white', opacity: 0.9 }} /> },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setAnchorEl(null);
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Enhanced Navbar */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          backgroundColor: 'white',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              flex: 1
            }}
            onClick={() => navigate('/')}
          >
            <Typography 
              variant="h5" 
              fontWeight={800} 
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              🏛️ Panchayat
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {user ? (
              <>
                <Button 
                  variant="outlined" 
                  startIcon={<DashboardIcon />}
                  onClick={() => navigate('/dashboard')}
                  sx={{ 
                    display: { xs: 'none', sm: 'inline-flex' },
                    borderColor: '#667eea',
                    color: '#667eea',
                    '&:hover': {
                      borderColor: '#764ba2',
                      backgroundColor: '#f3f4f6',
                    }
                  }}
                >
                  Dashboard
                </Button>
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                  <Avatar 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontSize: '0.9rem',
                      fontWeight: 700
                    }}
                  >
                    {getInitials(user?.name || user?.fullName)}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{ sx: { mt: 1, minWidth: 200 } }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {user?.name || user?.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={() => { navigate('/dashboard'); setAnchorEl(null); }}>
                    <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
                    Dashboard
                  </MenuItem>
                  <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}>
                    <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                    Profile
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button 
                  startIcon={<LoginIcon />}
                  onClick={() => navigate('/login')}
                  sx={{ 
                    display: { xs: 'none', sm: 'inline-flex' },
                    color: '#667eea',
                    '&:hover': {
                      backgroundColor: '#f3f4f6',
                    }
                  }}
                >
                  Login
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<RegisterIcon />}
                  onClick={() => navigate('/register')}
                  sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontWeight: 600,
                    boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a4493 100%)',
                      boxShadow: '0 6px 20px 0 rgba(102, 126, 234, 0.5)',
                    }
                  }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section - Enhanced */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 10, md: 14 },
          px: 2,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)',
            pointerEvents: 'none',
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={800}>
            <Box>
              <Chip 
                icon={<VerifiedIcon />}
                label="डिजिटल इंडिया का नया ज़माना 🚀" 
                sx={{ 
                  mb: 3, 
                  fontWeight: 600, 
                  px: 1,
                  backgroundColor: '#fbbf24',
                  color: 'white',
                  '& .MuiChip-icon': { color: 'white' }
                }} 
              />
              <Typography
                variant="h2"
                fontWeight={900}
                gutterBottom
                sx={{ 
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  letterSpacing: '-0.02em'
                }}
              >
                🌾 पंचायत 🏛️
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  opacity: 0.95
                }}
              >
                अपने गाँव की आवाज़, सरकार के पास!
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 5, 
                  opacity: 0.9, 
                  maxWidth: 700, 
                  mx: 'auto',
                  fontWeight: 400,
                  lineHeight: 1.6
                }}
              >
                सड़क टूटी? बिजली गायब? पानी की समस्या? 
                <br />
                अब चुप मत बैठो! अपनी शिकायत दर्ज करो और देखो कैसे होती है सुनवाई। 💪
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                {!user && (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<RegisterIcon />}
                      onClick={() => navigate('/register')}
                      sx={{ 
                        px: 5, 
                        py: 2, 
                        fontSize: '1.1rem', 
                        fontWeight: 700,
                        bgcolor: '#fbbf24',
                        color: '#1f2937',
                        boxShadow: '0 4px 14px rgba(251, 191, 36, 0.4)',
                        '&:hover': {
                          bgcolor: '#f59e0b',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(251, 191, 36, 0.5)',
                        },
                        transition: 'all 0.3s'
                      }}
                    >
                      Get Started Free
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<LoginIcon />}
                      onClick={() => navigate('/login')}
                      sx={{ 
                        px: 5, 
                        py: 2, 
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: 'white', 
                        borderColor: 'white',
                        borderWidth: 2,
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255,255,255,0.15)',
                          borderWidth: 2,
                        }
                      }}
                    >
                      Sign In
                    </Button>
                  </>
                )}
                {user && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<DashboardIcon />}
                    onClick={() => navigate('/dashboard')}
                    sx={{ 
                      px: 5, 
                      py: 2, 
                      fontSize: '1.1rem', 
                      fontWeight: 700,
                      bgcolor: '#fbbf24',
                      color: '#1f2937',
                      boxShadow: '0 4px 14px rgba(251, 191, 36, 0.4)',
                      '&:hover': {
                        bgcolor: '#f59e0b',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(251, 191, 36, 0.5)',
                      },
                      transition: 'all 0.3s'
                    }}
                  >
                    Go to Dashboard
                  </Button>
                )}
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Stats Section - Enhanced */}
      <Box sx={{ backgroundColor: '#6366f1', py: 6 }}>
        <Container maxWidth="lg">
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: 'white' }} />
            </Box>
          ) : (
            <Grid container spacing={3} justifyContent="center">
              {stats && stats.map((s, index) => (
                <Grid item xs={6} md={3} key={s.label}>
                  <Fade in timeout={800 + index * 200}>
                    <Paper
                      elevation={0}
                      sx={{
                        textAlign: 'center',
                        p: 3,
                        backgroundColor: 'rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 3,
                        border: '1px solid rgba(255,255,255,0.2)',
                        transition: 'all 0.3s',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.18)',
                          transform: 'translateY(-4px)',
                          border: '1px solid rgba(255,255,255,0.3)',
                        }
                      }}
                    >
                      <Box sx={{ mb: 1 }}>
                        {s.icon}
                      </Box>
                      <Typography 
                        variant="h3" 
                        fontWeight={800} 
                        color="white"
                        sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' } }}
                      >
                        {s.number}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="rgba(255,255,255,0.85)"
                        sx={{ fontWeight: 500, fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                      >
                        {s.label}
                      </Typography>
                    </Paper>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Features - Enhanced */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            fontWeight={800} 
            gutterBottom
            sx={{ 
              fontSize: { xs: '2rem', md: '2.75rem' },
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Why Choose पंचायत? 🤔
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            गाँव हो या शहर, अब हर जगह की समस्या का होगा हल!
          </Typography>
        </Box>
        <Grid container spacing={4}>
          {features.map((f, index) => (
            <Grid item xs={12} sm={6} md={4} key={f.title}>
              <Fade in timeout={1000 + index * 150}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    border: '2px solid #f3f4f6',
                    borderRadius: 3,
                    transition: 'all 0.3s',
                    '&:hover': { 
                      transform: 'translateY(-8px)', 
                      boxShadow: '0 12px 24px rgba(102, 126, 234, 0.15)',
                      borderColor: '#667eea',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      {f.icon}
                    </Box>
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 2, color: '#1f2937' }}>
                      {f.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {f.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How it works - Enhanced */}
      <Box sx={{ backgroundColor: '#f9fafb', py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h3" 
              fontWeight={800} 
              gutterBottom
              sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, color: '#1f2937' }}
            >
              कैसे काम करता है? 🛠️
            </Typography>
            <Typography variant="h6" color="text.secondary">
              बस 4 आसान स्टेप्स में समस्या का समाधान!
            </Typography>
          </Box>
          <Grid container spacing={4} alignItems="stretch">
            {[
              { 
                step: '1', 
                title: '📱 रजिस्टर करो', 
                desc: 'मुफ़्त में साइन अप करो। नाम, फोन, गाँव बताओ बस!',
                color: '#667eea'
              },
              { 
                step: '2', 
                title: '📸 शिकायत करो', 
                desc: 'फोटो लगाओ, जगह बताओ, पूरी बात लिखो। आसान है!',
                color: '#10b981'
              },
              { 
                step: '3', 
                title: '🔔 ट्रैक करो', 
                desc: 'हर अपडेट मिलेगा नोटिफिकेशन से। क्या हो रहा है, सब दिखेगा!',
                color: '#f59e0b'
              },
              { 
                step: '4', 
                title: '✅ समाधान पाओ', 
                desc: 'अफसर काम करेंगे, प्रूफ के साथ रिज़ॉल्व करेंगे। पक्का!',
                color: '#ef4444'
              },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={item.step}>
                <Fade in timeout={1200 + index * 200}>
                  <Paper
                    elevation={0}
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      p: 4,
                      borderRadius: 3,
                      backgroundColor: 'white',
                      border: '2px solid #f3f4f6',
                      position: 'relative',
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderColor: item.color,
                        transform: 'translateY(-8px)',
                        boxShadow: `0 12px 24px ${item.color}30`,
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 32,
                        fontWeight: 800,
                        mx: 'auto',
                        mb: 3,
                        boxShadow: `0 8px 16px ${item.color}40`,
                      }}
                    >
                      {item.step}
                    </Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#1f2937' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {item.desc}
                    </Typography>
                  </Paper>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section - Enhanced */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 10,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
            तैयार हो बदलाव के लिए? 💪
          </Typography>
          <Typography variant="h6" sx={{ mb: 5, opacity: 0.95, lineHeight: 1.7 }}>
            हज़ारों लोग पहले से जुड़े हैं पंचायत से। अपनी समस्या का हल पाओ, 
            अपने गाँव/शहर को बेहतर बनाओ। साथ मिलकर, सब संभव है! 🚀
          </Typography>
          {!user ? (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<RegisterIcon />}
                onClick={() => navigate('/register')}
                sx={{ 
                  px: 5, 
                  py: 2, 
                  fontWeight: 700, 
                  fontSize: '1.1rem',
                  bgcolor: '#fbbf24',
                  color: '#1f2937',
                  boxShadow: '0 4px 14px rgba(251, 191, 36, 0.4)',
                  '&:hover': {
                    bgcolor: '#f59e0b',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Join Now — It's Free
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<LoginIcon />}
                onClick={() => navigate('/login')}
                sx={{ 
                  px: 5, 
                  py: 2, 
                  fontWeight: 700, 
                  fontSize: '1.1rem',
                  color: 'white',
                  borderColor: 'white',
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    borderWidth: 2,
                  }
                }}
              >
                Sign In
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              size="large"
              startIcon={<ReportIcon />}
              onClick={() => navigate('/dashboard')}
              sx={{ 
                px: 5, 
                py: 2, 
                fontWeight: 700, 
                fontSize: '1.1rem',
                bgcolor: '#fbbf24',
                color: '#1f2937',
                boxShadow: '0 4px 14px rgba(251, 191, 36, 0.4)',
                '&:hover': {
                  bgcolor: '#f59e0b',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              File a Complaint
            </Button>
          )}
        </Container>
      </Box>

      {/* Footer - Enhanced */}
      <Box sx={{ backgroundColor: '#1f2937', color: 'rgba(255,255,255,0.7)', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography 
                variant="h5" 
                fontWeight={800} 
                sx={{ 
                  color: 'white',
                  mb: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                🏛️ Panchayat
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.7 }}>
                Empowering citizens to build better communities through transparent 
                civic engagement and responsive local governance.
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.5 }}>
                © {new Date().getFullYear()} Panchayat. All rights reserved.
              </Typography>
            </Grid>
            
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" fontWeight={700} color="white" gutterBottom>
                Platform
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography 
                  variant="body2" 
                  sx={{ cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: '#667eea' } }}
                  onClick={() => navigate('/register')}
                >
                  Register
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: '#667eea' } }}
                  onClick={() => navigate('/login')}
                >
                  Login
                </Typography>
                {user && (
                  <Typography 
                    variant="body2" 
                    sx={{ cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: '#667eea' } }}
                    onClick={() => navigate('/dashboard')}
                  >
                    Dashboard
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" fontWeight={700} color="white" gutterBottom>
                Features
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">File Complaints</Typography>
                <Typography variant="body2">Track Status</Typography>
                <Typography variant="body2">Real-time Updates</Typography>
                <Typography variant="body2">Community Voting</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" fontWeight={700} color="white" gutterBottom>
                About
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                Panchayat is a digital platform designed to streamline civic 
                grievance management and foster better communication between 
                citizens and local authorities.
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              Made with ❤️ by <strong style={{ color: '#fbbf24' }}>Durga Maddheshiya</strong> &nbsp;|&nbsp; Report. Track. Resolve. &nbsp;|&nbsp; © {new Date().getFullYear()} Panchayat
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
