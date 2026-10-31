import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/notifications?limit=20');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications');
  }
});

export const fetchUnreadCount = createAsyncThunk('notifications/fetchUnreadCount', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/notifications/unread-count');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch unread count');
  }
});

export const markAllRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    const res = await api.put('/notifications/mark-all-read');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to mark read');
  }
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload.data;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count;
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.unreadCount = 0;
        state.items.forEach(n => { n.read = true; });
      });
  }
});

export default notificationsSlice.reducer;
