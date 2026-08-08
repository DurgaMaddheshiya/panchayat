import React from 'react';
import { Card, CardContent, Box, Typography, Avatar } from '@mui/material';
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material';

const StatsCard = ({
  title,
  value,
  icon,
  color = '#1976d2',
  bgColor = '#e3f2fd',
  trend,
  trendValue,
  subtitle,
}) => {
  const isPositive = trend === 'up';

  return (
    <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} color={color} sx={{ lineHeight: 1.2 }}>
              {value ?? 0}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
            {trendValue && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                {isPositive ? (
                  <TrendingUpIcon fontSize="small" color="success" />
                ) : (
                  <TrendingDownIcon fontSize="small" color="error" />
                )}
                <Typography variant="caption" color={isPositive ? 'success.main' : 'error.main'} fontWeight={600}>
                  {trendValue}
                </Typography>
                <Typography variant="caption" color="text.secondary">vs last week</Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: bgColor, color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
