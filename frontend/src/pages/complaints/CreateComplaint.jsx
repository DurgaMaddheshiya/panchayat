import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Grid,
  MenuItem, Stepper, Step, StepLabel, CircularProgress,
  Alert, Divider, IconButton, Chip, List, ListItem, ListItemText, ListItemSecondaryAction,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Send as SendIcon,
  LocationOn as LocationIcon,
  AttachFile as AttachIcon,
  PhotoCamera as CameraIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { createComplaint } from '../../redux/slices/complaintSlice';

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

const PRIORITIES = [
  { value: 'LOW', label: 'Low', desc: 'Minor inconvenience' },
  { value: 'MEDIUM', label: 'Medium', desc: 'Affecting daily life' },
  { value: 'HIGH', label: 'High', desc: 'Urgent attention needed' },
  { value: 'CRITICAL', label: 'Critical', desc: 'Emergency situation' },
];

const initialForm = {
  title: '',
  description: '',
  category: '',
  priority: 'MEDIUM',
  address: '',
  village: '',
  wardNumber: '',
  district: '',
  state: '',
  latitude: '',
  longitude: '',
  isAnonymous: false,
};

const CreateComplaint = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.complaints);

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');

  const steps = ['Basic Details', 'Location', 'Attachments', 'Review & Submit'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 0) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      else if (formData.title.trim().length < 10) newErrors.title = 'Title must be at least 10 characters';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      else if (formData.description.trim().length < 20) newErrors.description = 'Description must be at least 20 characters';
      if (!formData.category) newErrors.category = 'Category is required';
    }
    if (step === 1) {
      if (!formData.address.trim()) newErrors.address = 'Address is required';
    }
    return newErrors;
  };

  const handleNext = () => {
    const stepErrors = validateStep(activeStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setActiveStep(activeStep + 1);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData({
          ...formData,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        });
        setLocationLoading(false);
      },
      () => setLocationLoading(false)
    );
  };

  const handleFileSelect = (e) => {
    setFileError('');
    const selectedFiles = Array.from(e.target.files);
    
    // Validate file count
    if (files.length + selectedFiles.length > 5) {
      setFileError('Maximum 5 files allowed');
      return;
    }

    // Validate file types and size
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const validFiles = selectedFiles.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        setFileError(`${file.name}: Invalid file type. Only images and PDF allowed.`);
        return false;
      }
      if (file.size > maxSize) {
        setFileError(`${file.name}: File too large. Max 5MB per file.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setFiles([...files, ...validFiles]);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setFileError('');
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async () => {
    setSubmitError('');
    
    // For now, submit without files (backend doesn't support file upload yet)
    // Clean up payload — only send fields backend expects
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      priority: formData.priority,
      address: formData.address.trim(),
      village: formData.village.trim() || undefined,
      wardNumber: formData.wardNumber ? parseInt(formData.wardNumber, 10) : undefined,
      district: formData.district.trim() || undefined,
      state: formData.state.trim() || undefined,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      isAnonymous: formData.isAnonymous,
    };

    // Remove undefined keys
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

    const result = await dispatch(createComplaint(payload));
    if (result.type === 'complaints/create/fulfilled') {
      const id = result.payload?.id || result.payload?.data?.id;
      navigate(id ? `/complaints/${id}` : '/complaints');
    } else {
      setSubmitError(result.payload || 'Failed to submit complaint. Please try again.');
    }
    
    // TODO: When backend supports file upload, use this code:
    /*
    const formDataToSend = new FormData();
    formDataToSend.append('complaint', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    files.forEach((file) => {
      formDataToSend.append('files', file);
    });
    const result = await dispatch(createComplaint(formDataToSend));
    */
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required fullWidth label="Complaint Title" name="title"
                value={formData.title} onChange={handleChange}
                error={!!errors.title} helperText={errors.title || 'Brief title (min 10 chars)'}
                inputProps={{ maxLength: 200 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required fullWidth multiline rows={4}
                label="Description" name="description"
                value={formData.description} onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description || `Describe the issue clearly (${formData.description.length}/1000, min 20)`}
                inputProps={{ maxLength: 1000 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required fullWidth select label="Category"
                name="category" value={formData.category} onChange={handleChange}
                error={!!errors.category} helperText={errors.category || 'Select issue type'}
              >
                {CATEGORIES.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth select label="Priority"
                name="priority" value={formData.priority} onChange={handleChange}
              >
                {PRIORITIES.map(p => (
                  <MenuItem key={p.value} value={p.value}>
                    {p.label} — {p.desc}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required fullWidth label="Full Address"
                name="address" value={formData.address} onChange={handleChange}
                error={!!errors.address} helperText={errors.address || 'Enter full address of the issue'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Village / Area"
                name="village" value={formData.village} onChange={handleChange}
                helperText="Optional"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Ward Number" type="number"
                name="wardNumber" value={formData.wardNumber} onChange={handleChange}
                helperText="Optional"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="District"
                name="district" value={formData.district} onChange={handleChange}
                helperText="Optional"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="State"
                name="state" value={formData.state} onChange={handleChange}
                helperText="Optional"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  fullWidth label="Latitude" name="latitude"
                  value={formData.latitude} onChange={handleChange}
                  placeholder="e.g. 28.6139"
                />
                <TextField
                  fullWidth label="Longitude" name="longitude"
                  value={formData.longitude} onChange={handleChange}
                  placeholder="e.g. 77.2090"
                />
                <Button
                  variant="outlined"
                  startIcon={<LocationIcon />}
                  onClick={handleGetLocation}
                  disabled={locationLoading}
                  sx={{ whiteSpace: 'nowrap', minWidth: 140 }}
                >
                  {locationLoading ? 'Locating...' : 'Use GPS'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Box>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>Note:</strong> File upload feature is coming soon. For now, you can skip this step and submit your complaint.
            </Alert>
            <Alert severity="info" sx={{ mb: 2 }}>
              Attach photos or documents to support your complaint (Optional)
            </Alert>
            
            <Box sx={{ mb: 3 }}>
              <input
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                id="file-upload"
                multiple
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AttachIcon />}
                  sx={{ mr: 1, mb: 1 }}
                >
                  Choose Files
                </Button>
              </label>

              <input
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                id="camera-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="camera-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CameraIcon />}
                  sx={{ mb: 1 }}
                >
                  Take Photo
                </Button>
              </label>

              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                Accepted: Images (JPG, PNG, GIF) and PDF | Max 5 files, 5MB each
              </Typography>
            </Box>

            {fileError && (
              <Alert severity="error" sx={{ mb: 2 }}>{fileError}</Alert>
            )}

            {files.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Attached Files ({files.length}/5)
                </Typography>
                <List dense>
                  {files.map((file, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <Box sx={{ mr: 1, fontSize: '1.5rem' }}>
                        {getFileIcon(file.type)}
                      </Box>
                      <ListItemText
                        primary={file.name}
                        secondary={formatFileSize(file.size)}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveFile(index)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {files.length === 0 && (
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: '#f9fafb',
                }}
              >
                <FileIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No files attached yet. Add photos or documents to strengthen your complaint.
                </Typography>
              </Box>
            )}
          </Box>
        );
      case 3:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Please review your complaint before submitting.
            </Alert>
            <Grid container spacing={2}>
              {[
                { label: 'Title', value: formData.title },
                { label: 'Category', value: CATEGORIES.find(c => c.value === formData.category)?.label },
                { label: 'Priority', value: formData.priority },
                { label: 'Address', value: formData.address },
                { label: 'Village', value: formData.village || 'N/A' },
                { label: 'Ward Number', value: formData.wardNumber || 'N/A' },
                { label: 'District', value: formData.district || 'N/A' },
                { label: 'State', value: formData.state || 'N/A' },
              ].map(({ label, value }) => (
                <Grid item xs={12} sm={6} key={label}>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={600}>{value}</Typography>
                  <Divider sx={{ mt: 0.5 }} />
                </Grid>
              ))}
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Description</Typography>
                <Typography variant="body2">{formData.description}</Typography>
              </Grid>
              {files.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Attachments</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                    {files.map((file, index) => (
                      <Chip
                        key={index}
                        icon={<span>{getFileIcon(file.type)}</span>}
                        label={`${file.name.substring(0, 20)}${file.name.length > 20 ? '...' : ''}`}
                        size="small"
                        sx={{ backgroundColor: '#f3f4f6' }}
                      />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)}>Back</Button>
        <Typography variant="h5" fontWeight={700}>File a Complaint</Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 4, borderRadius: 2, maxWidth: 800 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>

        {renderStep()}

        {(submitError || error) && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {submitError || error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={() => setActiveStep(activeStep - 1)}
            variant="outlined"
          >
            Back
          </Button>

          {activeStep < steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateComplaint;
