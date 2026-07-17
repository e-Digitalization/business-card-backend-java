import React from 'react';
import { Paper, Typography } from '@mui/material';

const StatCard = ({ title, value, subtitle, color }) => {
  return (
    <Paper
      className="glass-card"
      sx={{
        p: 2,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5
      }}
    >
      <Typography variant="body2" color="text.secondary" fontWeight={600}>
        {title}
      </Typography>
      <Typography variant="h4" fontWeight={800} sx={{ color: color || 'text.primary', lineHeight: 1.1 }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
};

export default StatCard;

