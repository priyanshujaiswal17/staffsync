import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchTodayAttendance = createAsyncThunk('attendance/fetchToday', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/attendance/today');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch status');
  }
});

export const checkIn = createAsyncThunk('attendance/checkIn', async (_, { rejectWithValue }) => {
  try {
    const res = await api.post('/attendance/check-in');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Check-in failed');
  }
});

export const checkOut = createAsyncThunk('attendance/checkOut', async (_, { rejectWithValue }) => {
  try {
    const res = await api.post('/attendance/check-out');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Check-out failed');
  }
});

export const fetchMyHistory = createAsyncThunk('attendance/fetchHistory', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/attendance/my-history', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch history');
  }
});

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    today: null,
    history: [],
    page: 1,
    pages: 1,
    total: 0,
    loading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    clearAttendanceStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodayAttendance.fulfilled, (state, action) => {
        state.today = action.payload.data;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.today = action.payload.data;
        state.successMessage = action.payload.message;
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.today = action.payload.data;
        state.successMessage = action.payload.message;
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchMyHistory.fulfilled, (state, action) => {
        state.history = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      });
  }
});

export const { clearAttendanceStatus } = attendanceSlice.actions;
export default attendanceSlice.reducer;
