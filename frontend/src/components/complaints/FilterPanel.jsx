import React from 'react';
import {
  Box, Paper, TextField, MenuItem, Button, Grid,
  Typography, IconButton, Collapse,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'ROAD', label: 'Road & Infrastructure' },
  { value: 'WATER', label: 'Water Supply' },
  { value: 'ELECTRICITY', label: 'Electricity' },
  { value: 'SANITATION', label: 'Sanitation & Waste' },
  { value: 'PARKS', label: 'Parks & Gardens' },
  { value: 'NOISE', label: 'Noise Pollution' },
  { value: 'OTHER', label: 'Other' },
];

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'REJECTED', label: 'Rejected' },
];

const PRIORITIES = [
  { value: '', label: 'All Priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const FilterPanel = ({ filters, onChange, onClear, showFilters, onToggle }) => {
  const isFiltered = filters.search || filters.status || filters.category || filters.priority;

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search complaints..."
          name="search"
          value={filters.search || ''}
          onChange={onChange}
          sx={{ flex: 1, minWidth: 180 }}
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />,
          }}
        />
        <IconButton onClick={onToggle} color={showFilters ? 'primary' : 'default'} title="Filters">
          <FilterIcon />
        </IconButton>
        {isFiltered && (
          <Button size="small" color="error" startIcon={<ClearIcon />} onClick={onClear}>
            Clear
          </Button>
        )}
      </Box>

      <Collapse in={showFilters}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              select fullWidth size="small" label="Status"
              name="status" value={filters.status || ''} onChange={onChange}
            >
              {STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select fullWidth size="small" label="Category"
              name="category" value={filters.category || ''} onChange={onChange}
            >
              {CATEGORIES.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select fullWidth size="small" label="Priority"
              name="priority" value={filters.priority || ''} onChange={onChange}
            >
              {PRIORITIES.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </Collapse>
    </Paper>
  );
};

export default FilterPanel;
