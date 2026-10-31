import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchEmployees = createAsyncThunk('employees/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/employees', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch employees');
  }
});

export const createEmployee = createAsyncThunk('employees/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/employees', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create employee');
  }
});

export const updateEmployee = createAsyncThunk('employees/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/employees/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update employee');
  }
});

const employeesSlice = createSlice({
  name: 'employees',
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
      .addCase(fetchEmployees.pending, (state) => { state.loading = true; })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default employeesSlice.reducer;
