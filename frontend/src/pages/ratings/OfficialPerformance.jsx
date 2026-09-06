import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, Chip,
  Divider, CircularProgress, LinearProgress, Button, Paper,
  Table, TableBody, TableCell, TableHead, TableRow, Alert,
  Tabs, Tab, Pagination, TextField, InputAdornment,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  Assignment as AssignIcon,
} from '@mui/icons-material';
import { Rating } from '@mui/material';
import api from '../../services/api';

const RatingBar = ({ label, value, total, color }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
      <Typography variant="caption" sx={{ minWidth: 14, textAlign: 'right' }}>{label}</Typography>
      <StarIcon sx={{ fontSize: 14, color: 'warning.main' }} />
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          flex: 1, height: 8, borderRadius: 4,
          bgcolor: 'grey.200',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
        }}
      />
      <Typography variant="caption" sx={{ minWidth: 28, color: 'text.secondary' }}>
        {value}
      </Typography>
    </Box>
  );
};

const StarDisplay = ({ value, count, size = 'medium' }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
    <Rating value={value || 0} readOnly size={size} precision={0.1} />
    <Typography variant="body2" fontWeight={700} color="warning.dark">
      {value ? value.toFixed(1) : '—'}
    </Typography>
    {count !== undefined && (
      <Typography variant="caption" color="text.secondary">
        ({count} ratings)
      </Typography>
    )}
  </Box>
);

const OfficialPerformance = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedOfficial, setSelectedOfficial] = useState(null);
  const [officialStats, setOfficialStats] = useState(null);
  const [officialRatings, setOfficialRatings] = useState([]);
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [ratingsPage, setRatingsPage] = useState(0);
  const [ratingsTotalPages, setRatingsTotalPages] = useState(0);

  useEffect(() => {
    fetchLeaderboard();
    fetchOfficials();
  }, []);

  useEffect(() => {
    if (selectedOfficial) {
      fetchOfficialStats(selectedOfficial.id);
      fetchOfficialRatings(selectedOfficial.id, 0);
    }
  }, [selectedOfficial]); // eslint-disable-line

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/ratings/leaderboard?limit=10');
      setLeaderboard(res.data?.data || []);
    } catch (e) {
      console.error('Failed to fetch leaderboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficials = async () => {
    try {
      const res = await api.get('/api/users/officials');
      const data = res.data?.data || res.data || [];
      setOfficials(Array.isArray(data) ? data : []);
    } catch (e) {}
  };

  const fetchOfficialStats = async (officialId) => {
    try {
      const res = await api.get(`/api/ratings/official/${officialId}/stats`);
      setOfficialStats(res.data?.data || null);
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    }
  };

  const fetchOfficialRatings = async (officialId, page) => {
    try {
      setRatingsLoading(true);
      const res = await api.get(`/api/ratings/official/${officialId}?page=${page}&size=8`);
      const data = res.data?.data;
      setOfficialRatings(data?.content || []);
      setRatingsTotalPages(data?.totalPages || 0);
      setRatingsPage(page);
    } catch (e) {
      console.error('Failed to fetch ratings:', e);
    } finally {
      setRatingsLoading(false);
    }
  };

  const getRatingColor = (avg) => {
    if (avg >= 4.5) return '#10b981';
    if (avg >= 3.5) return '#3b82f6';
    if (avg >= 2.5) return '#f59e0b';
    return '#ef4444';
  };

  const getRatingLabel = (avg) => {
    if (!avg) return 'No Ratings';
    if (avg >= 4.5) return 'Excellent';
    if (avg >= 3.5) return 'Very Good';
    if (avg >= 2.5) return 'Good';
    if (avg >= 1.5) return 'Fair';
    return 'Poor';
  };

  const filteredOfficials = officials.filter(o =>
    (o.fullName || o.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/dashboard')}>
          Back
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>
            ⭐ Official Performance Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Citizen ratings and feedback for government officials
          </Typography>
        </Box>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tab icon={<TrophyIcon />} iconPosition="start" label="Leaderboard" />
        <Tab icon={<PersonIcon />} iconPosition="start" label="Official Details" />
      </Tabs>

      {/* ── TAB 0: Leaderboard ── */}
      {tab === 0 && (
        <Box>
          {loading ? (
            <Box textAlign="center" py={6}><CircularProgress /></Box>
          ) : leaderboard.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              No ratings yet. Citizens can rate officials after their complaints are resolved.
            </Alert>
          ) : (
            <>
              {/* Top 3 Podium */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {leaderboard.slice(0, 3).map((official, idx) => (
                  <Grid item xs={12} md={4} key={official.officialId}>
                    <Card
                      elevation={idx === 0 ? 6 : 2}
                      sx={{
                        borderRadius: 3, textAlign: 'center', p: 1,
                        border: '2px solid',
                        borderColor: idx === 0 ? 'warning.400' : idx === 1 ? 'grey.400' : '#cd7f32',
                        position: 'relative', overflow: 'visible',
                        cursor: 'pointer',
                        '&:hover': { transform: 'translateY(-2px)', transition: 'all 0.2s' },
                      }}
                      onClick={() => {
                        setSelectedOfficial({ id: official.officialId, fullName: official.officialName });
                        setTab(1);
                      }}
                    >
                      {/* Rank badge */}
                      <Box sx={{
                        position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
                        width: 32, height: 32, borderRadius: '50%',
                        bgcolor: idx === 0 ? 'warning.main' : idx === 1 ? 'grey.500' : '#cd7f32',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, color: 'white', fontSize: 14,
                      }}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                      </Box>

                      <CardContent sx={{ pt: 3 }}>
                        <Avatar sx={{
                          width: 60, height: 60, margin: '0 auto 8px',
                          fontSize: 22, bgcolor: getRatingColor(official.averageRating),
                        }}>
                          {official.officialName?.[0]}
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight={700}>{official.officialName}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                          <StarDisplay value={official.averageRating} count={official.totalRatings} size="small" />
                        </Box>
                        <Chip
                          label={getRatingLabel(official.averageRating)}
                          size="small"
                          sx={{ mt: 1, bgcolor: getRatingColor(official.averageRating), color: 'white', fontWeight: 600 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Full Leaderboard Table */}
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrophyIcon color="warning" />
                    <Typography variant="h6" fontWeight={600}>Full Rankings</Typography>
                  </Box>
                  <Divider />
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                      <TableRow>
                        <TableCell><strong>Rank</strong></TableCell>
                        <TableCell><strong>Official</strong></TableCell>
                        <TableCell><strong>Rating</strong></TableCell>
                        <TableCell><strong>Total Reviews</strong></TableCell>
                        <TableCell><strong>Performance</strong></TableCell>
                        <TableCell><strong>Details</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leaderboard.map((official, idx) => (
                        <TableRow key={official.officialId} hover>
                          <TableCell>
                            <Typography fontWeight={700} color={idx < 3 ? 'warning.dark' : 'text.primary'}>
                              #{idx + 1}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: getRatingColor(official.averageRating) }}>
                                {official.officialName?.[0]}
                              </Avatar>
                              <Typography variant="body2" fontWeight={600}>{official.officialName}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <StarDisplay value={official.averageRating} size="small" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{official.totalRatings} reviews</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getRatingLabel(official.averageRating)}
                              size="small"
                              sx={{ bgcolor: getRatingColor(official.averageRating), color: 'white', fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small" variant="outlined"
                              onClick={() => {
                                setSelectedOfficial({ id: official.officialId, fullName: official.officialName });
                                setTab(1);
                              }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </Box>
      )}

      {/* ── TAB 1: Official Details ── */}
      {tab === 1 && (
        <Grid container spacing={3}>
          {/* Left: official selector */}
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Select Official
                </Typography>
                <TextField
                  fullWidth size="small" placeholder="Search official..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                  {filteredOfficials.map(o => (
                    <Box
                      key={o.id}
                      onClick={() => setSelectedOfficial(o)}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5,
                        p: 1.5, borderRadius: 2, cursor: 'pointer', mb: 0.5,
                        bgcolor: selectedOfficial?.id === o.id ? 'primary.50' : 'transparent',
                        border: '1px solid',
                        borderColor: selectedOfficial?.id === o.id ? 'primary.300' : 'transparent',
                        '&:hover': { bgcolor: 'grey.50' },
                      }}
                    >
                      <Avatar sx={{ width: 36, height: 36, fontSize: 14, bgcolor: 'primary.main' }}>
                        {(o.fullName || o.name)?.[0]}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {o.fullName || o.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {o.role?.toString().replace('ROLE_','').replace(/_/g,' ')}
                        </Typography>
                      </Box>
                      {selectedOfficial?.id === o.id && <CheckIcon fontSize="small" color="primary" />}
                    </Box>
                  ))}
                  {filteredOfficials.length === 0 && (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                      No officials found
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right: stats + reviews */}
          <Grid item xs={12} md={8}>
            {!selectedOfficial ? (
              <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">Select an official to view their performance</Typography>
              </Paper>
            ) : officialStats ? (
              <>
                {/* Stats Card */}
                <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
                  <CardContent>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ width: 64, height: 64, fontSize: 24, bgcolor: getRatingColor(officialStats.averageRating) }}>
                        {officialStats.officialName?.[0]}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={700}>{officialStats.officialName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {officialStats.officialRole?.replace('ROLE_','').replace(/_/g,' ')}
                        </Typography>
                        <Chip
                          label={getRatingLabel(officialStats.averageRating)}
                          size="small"
                          sx={{ mt: 0.5, bgcolor: getRatingColor(officialStats.averageRating), color: 'white', fontWeight: 600 }}
                        />
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight={900} color={getRatingColor(officialStats.averageRating)}>
                          {officialStats.averageRating?.toFixed(1) || '—'}
                        </Typography>
                        <Rating value={officialStats.averageRating || 0} readOnly precision={0.1} size="small" />
                        <Typography variant="caption" color="text.secondary" display="block">
                          {officialStats.totalRatings} reviews
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Stat Numbers */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      {[
                        { label: 'Resolved', value: officialStats.totalComplaintsResolved, icon: '✅', color: '#10b981' },
                        { label: 'Pending', value: officialStats.pendingComplaints, icon: '⏳', color: '#f59e0b' },
                        { label: 'This Month', value: officialStats.complaintsThisMonth, icon: '📅', color: '#3b82f6' },
                        { label: 'Total Reviews', value: officialStats.totalRatings, icon: '⭐', color: '#8b5cf6' },
                      ].map(s => (
                        <Grid item xs={6} md={3} key={s.label}>
                          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, border: `2px solid ${s.color}20` }}>
                            <Typography variant="h4" fontWeight={800} sx={{ color: s.color }}>{s.value ?? 0}</Typography>
                            <Typography variant="caption">{s.icon} {s.label}</Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>

                    {/* Rating Distribution */}
                    {officialStats.totalRatings > 0 && (
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>Rating Breakdown</Typography>
                        {[5, 4, 3, 2, 1].map(star => (
                          <RatingBar
                            key={star}
                            label={star}
                            value={officialStats.ratingDistribution?.[star] || 0}
                            total={officialStats.totalRatings}
                            color={star >= 4 ? '#10b981' : star === 3 ? '#f59e0b' : '#ef4444'}
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Reviews List */}
                <Card elevation={2} sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                      💬 Citizen Reviews ({officialStats.totalRatings})
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {ratingsLoading ? (
                      <Box textAlign="center" py={4}><CircularProgress size={32} /></Box>
                    ) : officialRatings.length === 0 ? (
                      <Box textAlign="center" py={4}>
                        <StarIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                        <Typography color="text.secondary" sx={{ mt: 1 }}>No reviews yet</Typography>
                      </Box>
                    ) : (
                      <>
                        {officialRatings.map(review => (
                          <Box key={review.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                              <Avatar sx={{ width: 36, height: 36, fontSize: 13, bgcolor: review.isAnonymous ? 'grey.400' : 'secondary.main' }}>
                                {review.isAnonymous ? '?' : review.citizenName?.[0]}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                  <Typography variant="body2" fontWeight={700}>
                                    {review.isAnonymous ? 'Anonymous' : review.citizenName}
                                  </Typography>
                                  <Rating value={review.rating} readOnly size="small" />
                                  <Typography variant="caption" color="text.secondary">
                                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                  </Typography>
                                </Box>
                                {review.complaintTitle && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                    <AssignIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="primary.main">
                                      {review.complaintTitle}
                                    </Typography>
                                  </Box>
                                )}
                                {review.feedback && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                    "{review.feedback}"
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        ))}

                        {ratingsTotalPages > 1 && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Pagination
                              count={ratingsTotalPages}
                              page={ratingsPage + 1}
                              onChange={(_, p) => fetchOfficialRatings(selectedOfficial.id, p - 1)}
                              color="primary" size="small"
                            />
                          </Box>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Box textAlign="center" py={6}><CircularProgress /></Box>
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default OfficialPerformance;