import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CATEGORY_COLORS = [
  '#2e7d32', '#1976d2', '#ed6c02', '#7b1fa2',
  '#0288d1', '#d32f2f', '#388e3c', '#f57c00',
];

const CategoryBarChart = ({ categoryStats }) => {
  if (!categoryStats || categoryStats.length === 0) return null;

  const data = {
    labels: categoryStats.map(c => c.category?.replace('_', ' ') || c.name),
    datasets: [
      {
        label: 'Complaints',
        data: categoryStats.map(c => c.count || c.total || 0),
        backgroundColor: CATEGORY_COLORS.slice(0, categoryStats.length),
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} complaints`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
  };

  return (
    <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Complaints by Category
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Distribution across issue types
        </Typography>
        <Box sx={{ height: 280, mt: 2 }}>
          <Bar data={data} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default CategoryBarChart;
