import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchAnnouncements = createAsyncThunk('announcements/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/announcements', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch announcements');
  }
});

export const createAnnouncement = createAsyncThunk('announcements/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/announcements', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create announcement');
  }
});

export const deleteAnnouncement = createAsyncThunk('announcements/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/announcements/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete announcement');
  }
});

const announcementsSlice = createSlice({
  name: 'announcements',
  initialState: {
    items: [],
    total: 0,
    page: 1,
    pages: 1,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.pending, (state) => { state.loading = true; })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.items.unshift(action.payload.data);
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.items = state.items.filter(a => a._id !== action.payload);
      });
  }
});

export default announcementsSlice.reducer;
