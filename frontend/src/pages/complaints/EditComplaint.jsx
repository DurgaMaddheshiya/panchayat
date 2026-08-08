import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Grid,
  MenuItem, CircularProgress, Alert,
} from '@mui/material';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import { fetchComplaintById, updateComplaint } from '../../redux/slices/complaintSlice';
import Loader from '../../components/common/Loader';

const CATEGORIES = [
  { value: 'ROAD', label: 'Road & Infrastructure' },
  { value: 'WATER', label: 'Water Supply' },
  { value: 'ELECTRICITY', label: 'Electricity' },
  { value: 'SANITATION', label: 'Sanitation & Waste' },
  { value: 'PARKS', label: 'Parks & Gardens' },
  { value: 'NOISE', label: 'Noise Pollution' },
  { value: 'BUILDING', label: 'Illegal Construction' },
  { value: 'DRAINAGE', label: 'Drainage & Sewage' },
  { value: 'STREET_LIGHT', label: 'Street Lights' },
  { value: 'OTHER', label: 'Other' },
];

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const EditComplaint = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentComplaint: complaint, loading } = useSelector((state) => state.complaints);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM',
    address: '',
    landmark: '',
    wardNumber: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    dispatch(fetchComplaintById(id));
  }, [id]);

  useEffect(() => {
    if (complaint) {
      setFormData({
        title: complaint.title || '',
        description: complaint.description || '',
        category: complaint.category || '',
        priority: complaint.priority || 'MEDIUM',
        address: complaint.address || '',
        landmark: complaint.landmark || '',
        wardNumber: complaint.wardNumber || '',
      });
    }
  }, [complaint]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateComplaint({ id, data: formData }));
    if (result.type === 'complaints/update/fulfilled') {
      setSaved(true);
      setTimeout(() => navigate(`/complaints/${id}`), 1500);
    }
  };

  if (loading && !complaint) return <Loader />;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)}>Back</Button>
        <Typography variant="h5" fontWeight={700}>Edit Complaint</Typography>
      </Box>

      {saved && <Alert severity="success" sx={{ mb: 2 }}>Complaint updated! Redirecting...</Alert>}

      <Paper elevation={2} sx={{ p: 4, borderRadius: 2, maxWidth: 800 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required fullWidth label="Title" name="title"
                value={formData.title} onChange={handleChange}
                inputProps={{ maxLength: 200 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required fullWidth multiline rows={4}
                label="Description" name="description"
                value={formData.description} onChange={handleChange}
                inputProps={{ maxLength: 1000 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required fullWidth select label="Category"
                name="category" value={formData.category} onChange={handleChange}
              >
                {CATEGORIES.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth select label="Priority"
                name="priority" value={formData.priority} onChange={handleChange}
              >
                {PRIORITIES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required fullWidth label="Address"
                name="address" value={formData.address} onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth label="Landmark"
                name="landmark" value={formData.landmark} onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth label="Ward Number" type="number"
                name="wardNumber" value={formData.wardNumber} onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button variant="outlined" onClick={() => navigate(-1)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditComplaint;
