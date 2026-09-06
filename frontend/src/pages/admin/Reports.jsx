import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Paper, List, ListItem,
  ListItemText, Divider, Button, Select, MenuItem, FormControl,
  InputLabel, Table, TableBody, TableCell, TableHead, TableRow,
  Chip, LinearProgress
} from '@mui/material';
import {
  BarChart as ChartIcon,
  TrendingUp as TrendingIcon,
  Assessment as ReportIcon,
  Download as DownloadIcon,
  DateRange as DateIcon
} from '@mui/icons-material';
import api from '../../services/api';
import Loader from '../../components/common/Loader';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({});
  const [timeFilter, setTimeFilter] = useState('thisMonth');
  const [categoryStats, setCategoryStats] = useState([]);
  const [statusStats, setStatusStats] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, [timeFilter]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      const [dashboardRes, complaintsRes] = await Promise.all([
        api.get('/api/dashboard/stats'),
        api.get('/api/complaints?page=0&size=100')
      ]);

      // Handle both wrapped and unwrapped responses
      const dashData = dashboardRes.data?.data || dashboardRes.data;
      setReportData(dashData);
      
      // Process category stats from complaints
      const complaints = complaintsRes.data?.data?.content || complaintsRes.data?.content || [];
      const categoryMap = {};
      const statusMap = {};
      
      complaints.forEach(complaint => {
        if (complaint.category) categoryMap[complaint.category] = (categoryMap[complaint.category] || 0) + 1;
        if (complaint.status) statusMap[complaint.status] = (statusMap[complaint.status] || 0) + 1;
      });

      // Also use backend stats for status breakdown if available
      if (dashData?.categoryWiseStats) {
        Object.entries(dashData.categoryWiseStats).forEach(([key, val]) => {
          if (!categoryMap[key]) categoryMap[key] = val;
        });
      }

      setCategoryStats(Object.entries(categoryMap).map(([key, value]) => ({ name: key, count: value })));
      setStatusStats(Object.entries(statusMap).map(([key, value]) => ({ name: key, count: value })));

    } catch (error) {
      console.error('Error fetching report data:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    // Simple CSV download
    const csvData = [
      ['Metric', 'Value'],
      ['Total Complaints', reportData.totalComplaints || 0],
      ['Pending Complaints', reportData.pendingComplaints || 0],
      ['Resolved Complaints', reportData.resolvedComplaints || 0],
      ['Resolution Rate', `${reportData.resolutionRate || 0}%`],
      ['Total Users', reportData.totalUsers || 0],
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `panchayat-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const statusColors = {
    SUBMITTED: 'default',
    IN_PROGRESS: 'warning',
    RESOLVED: 'success',
    REJECTED: 'error',
  };

  return (
    <Box>
      <Card elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                📊 System Reports
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Comprehensive analytics and reporting dashboard
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Time Period</InputLabel>
                <Select
                  value={timeFilter}
                  label="Time Period"
                  onChange={(e) => setTimeFilter(e.target.value)}
                >
                  <MenuItem value="thisWeek">This Week</MenuItem>
                  <MenuItem value="thisMonth">This Month</MenuItem>
                  <MenuItem value="thisYear">This Year</MenuItem>
                  <MenuItem value="allTime">All Time</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={downloadReport}
              >
                Export CSV
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {loading ? <Loader /> : (
        <Grid container spacing={3}>
          {/* Key Metrics */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  📈 Key Performance Metrics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Total Complaints"
                      secondary={`${reportData.totalComplaints || 0} complaints registered`}
                    />
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      {reportData.totalComplaints || 0}
                    </Typography>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Resolution Rate"
                      secondary="Percentage of resolved complaints"
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={reportData.resolutionRate || 0}
                        sx={{ width: 60 }}
                        color="success"
                      />
                      <Typography variant="h6" fontWeight={600} color="success.main">
                        {reportData.resolutionRate || 0}%
                      </Typography>
                    </Box>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Average Resolution Time"
                      secondary="Days to resolve complaints"
                    />
                    <Typography variant="h5" fontWeight={700} color="info.main">
                      {Math.round(reportData.avgResolutionDays || 0)} days
                    </Typography>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Active Users"
                      secondary="Total registered users"
                    />
                    <Typography variant="h5" fontWeight={700} color="secondary.main">
                      {reportData.totalUsers || 0}
                    </Typography>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Status Breakdown */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  🎯 Status Breakdown
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Count</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statusStats.map((status) => {
                      const percentage = reportData.totalComplaints > 0 
                        ? ((status.count / reportData.totalComplaints) * 100).toFixed(1)
                        : 0;
                      return (
                        <TableRow key={status.name}>
                          <TableCell>
                            <Chip
                              label={status.name}
                              color={statusColors[status.name] || 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600}>{status.count}</Typography>
                          </TableCell>
                          <TableCell align="right">{percentage}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Analysis */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  🏷️ Category-wise Analysis
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Total Complaints</TableCell>
                      <TableCell align="right">Percentage of Total</TableCell>
                      <TableCell align="center">Trend</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categoryStats
                      .sort((a, b) => b.count - a.count)
                      .map((category) => {
                        const percentage = reportData.totalComplaints > 0
                          ? ((category.count / reportData.totalComplaints) * 100).toFixed(1)
                          : 0;
                        return (
                          <TableRow key={category.name}>
                            <TableCell>
                              <Typography fontWeight={600}>{category.name}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography fontWeight={600}>{category.count}</Typography>
                            </TableCell>
                            <TableCell align="right">{percentage}%</TableCell>
                            <TableCell align="center">
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(parseFloat(percentage), 100)}
                                sx={{ width: 100 }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Reports;