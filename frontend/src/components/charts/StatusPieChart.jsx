import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUS_COLORS = {
  PENDING: '#ed6c02',
  IN_PROGRESS: '#0288d1',
  RESOLVED: '#2e7d32',
  CLOSED: '#757575',
  REJECTED: '#d32f2f',
};

const StatusPieChart = ({ stats }) => {
  if (!stats) return null;

  const data = {
    labels: ['Pending', 'In Progress', 'Resolved', 'Closed', 'Rejected'],
    datasets: [
      {
        data: [
          stats.pendingComplaints || 0,
          stats.inProgressComplaints || 0,
          stats.resolvedComplaints || 0,
          stats.closedComplaints || 0,
          stats.rejectedComplaints || 0,
        ],
        backgroundColor: Object.values(STATUS_COLORS),
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 16, usePointStyle: true },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
            return ` ${context.label}: ${context.parsed} (${pct}%)`;
          },
        },
      },
    },
  };

  const total = (stats.pendingComplaints || 0) + (stats.inProgressComplaints || 0) +
    (stats.resolvedComplaints || 0) + (stats.closedComplaints || 0) + (stats.rejectedComplaints || 0);

  return (
    <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Complaints by Status
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Total: {total} complaints
        </Typography>
        <Box sx={{ height: 280, mt: 2 }}>
          {total === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="text.secondary">No data available</Typography>
            </Box>
          ) : (
            <Pie data={data} options={options} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatusPieChart;
