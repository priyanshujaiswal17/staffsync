import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchTrainings = createAsyncThunk('trainings/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/trainings', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch trainings');
  }
});

export const createTraining = createAsyncThunk('trainings/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/trainings', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create training');
  }
});

export const updateTraining = createAsyncThunk('trainings/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/trainings/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update training');
  }
});

const trainingsSlice = createSlice({
  name: 'trainings',
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
      .addCase(fetchTrainings.pending, (state) => { state.loading = true; })
      .addCase(fetchTrainings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchTrainings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTraining.fulfilled, (state, action) => {
        state.items.push(action.payload.data);
      })
      .addCase(updateTraining.fulfilled, (state, action) => {
        const idx = state.items.findIndex(t => t._id === action.payload.data._id);
        if (idx !== -1) state.items[idx] = action.payload.data;
      });
  }
});

export default trainingsSlice.reducer;
