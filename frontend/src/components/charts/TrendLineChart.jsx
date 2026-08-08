import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const TrendLineChart = ({ trendData, title = 'Complaint Trends' }) => {
  if (!trendData || trendData.length === 0) {
    // Generate sample monthly data if none provided
    trendData = [
      { month: 'Jan', filed: 12, resolved: 8 },
      { month: 'Feb', filed: 19, resolved: 14 },
      { month: 'Mar', filed: 15, resolved: 12 },
      { month: 'Apr', filed: 22, resolved: 18 },
      { month: 'May', filed: 28, resolved: 24 },
      { month: 'Jun', filed: 20, resolved: 17 },
    ];
  }

  const data = {
    labels: trendData.map(d => d.month || d.label),
    datasets: [
      {
        label: 'Filed',
        data: trendData.map(d => d.filed || d.total || 0),
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#1976d2',
        pointRadius: 4,
      },
      {
        label: 'Resolved',
        data: trendData.map(d => d.resolved || 0),
        borderColor: '#2e7d32',
        backgroundColor: 'rgba(46, 125, 50, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#2e7d32',
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { usePointStyle: true, padding: 16 },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 5 },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
  };

  return (
    <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>{title}</Typography>
        <Typography variant="caption" color="text.secondary">Monthly filing vs resolution</Typography>
        <Box sx={{ height: 280, mt: 2 }}>
          <Line data={data} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default TrendLineChart;
