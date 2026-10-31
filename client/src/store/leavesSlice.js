import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchMyLeaves = createAsyncThunk('leaves/fetchMyLeaves', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/leaves/my-leaves', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch leaves');
  }
});

export const fetchPendingLeaves = createAsyncThunk('leaves/fetchPendingLeaves', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/leaves/pending');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch pending leaves');
  }
});

export const applyLeave = createAsyncThunk('leaves/applyLeave', async (leaveData, { rejectWithValue }) => {
  try {
    const res = await api.post('/leaves/apply', leaveData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to apply for leave');
  }
});

export const reviewLeave = createAsyncThunk('leaves/reviewLeave', async ({ id, status, reviewNote }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/leaves/${id}/review`, { status, reviewNote });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to review leave');
  }
});

const leavesSlice = createSlice({
  name: 'leaves',
  initialState: {
    myLeaves: [],
    pendingLeaves: [],
    total: 0,
    page: 1,
    pages: 1,
    loading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    clearLeaveStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyLeaves.pending, (state) => { state.loading = true; })
      .addCase(fetchMyLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.myLeaves = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchMyLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPendingLeaves.fulfilled, (state, action) => {
        state.pendingLeaves = action.payload.data;
      })
      .addCase(applyLeave.fulfilled, (state) => {
        state.successMessage = 'Leave request submitted successfully';
      })
      .addCase(applyLeave.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(reviewLeave.fulfilled, (state, action) => {
        state.pendingLeaves = state.pendingLeaves.filter(l => l._id !== action.payload.data._id);
        state.successMessage = 'Leave review updated';
      });
  }
});

export const { clearLeaveStatus } = leavesSlice.actions;
export default leavesSlice.reducer;
