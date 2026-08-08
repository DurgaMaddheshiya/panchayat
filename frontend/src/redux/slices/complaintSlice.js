import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { toast } from 'react-toastify';

const initialState = {
  complaints: [],
  currentComplaint: null,
  myComplaints: [],
  trendingComplaints: [],
  loading: false,
  error: null,
  pagination: {
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  },
};

// Fetch all complaints
export const fetchComplaints = createAsyncThunk(
  'complaints/fetchAll',
  async ({ page = 0, size = 10, ...filters }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, size, ...filters });
      const response = await api.get(`${API_ENDPOINTS.COMPLAINTS.LIST}?${params}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Fetch complaint by ID
export const fetchComplaintById = createAsyncThunk(
  'complaints/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.COMPLAINTS.BY_ID(id));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Create complaint
export const createComplaint = createAsyncThunk(
  'complaints/create',
  async (complaintData, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.COMPLAINTS.CREATE, complaintData);
      toast.success('Complaint created successfully!');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Update complaint
export const updateComplaint = createAsyncThunk(
  'complaints/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(API_ENDPOINTS.COMPLAINTS.UPDATE(id), data);
      toast.success('Complaint updated successfully!');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Delete complaint
export const deleteComplaint = createAsyncThunk(
  'complaints/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(API_ENDPOINTS.COMPLAINTS.DELETE(id));
      toast.success('Complaint deleted successfully!');
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Fetch my complaints
export const fetchMyComplaints = createAsyncThunk(
  'complaints/fetchMy',
  async ({ page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.COMPLAINTS.MY_COMPLAINTS}?page=${page}&size=${size}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Upvote complaint
export const upvoteComplaint = createAsyncThunk(
  'complaints/upvote',
  async (id, { rejectWithValue }) => {
    try {
      await api.post(API_ENDPOINTS.VOTES.UPVOTE(id));
      toast.success('Upvoted!');
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Remove upvote
export const removeUpvote = createAsyncThunk(
  'complaints/removeUpvote',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(API_ENDPOINTS.VOTES.REMOVE_UPVOTE(id));
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const complaintSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {
    clearCurrentComplaint: (state) => {
      state.currentComplaint = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all complaints
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints = action.payload.content;
        state.pagination = {
          page: action.payload.pageNumber,
          size: action.payload.pageSize,
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch by ID
      .addCase(fetchComplaintById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComplaintById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentComplaint = action.payload;
      })
      .addCase(fetchComplaintById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createComplaint.pending, (state) => {
        state.loading = true;
      })
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints.unshift(action.payload);
      })
      .addCase(createComplaint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteComplaint.fulfilled, (state, action) => {
        state.complaints = state.complaints.filter(c => c.id !== action.payload);
        state.myComplaints = state.myComplaints.filter(c => c.id !== action.payload);
      })
      // Fetch my complaints
      .addCase(fetchMyComplaints.fulfilled, (state, action) => {
        state.myComplaints = action.payload.content;
        state.loading = false;
      });
  },
});

export const { clearCurrentComplaint, clearError } = complaintSlice.actions;
export default complaintSlice.reducer;