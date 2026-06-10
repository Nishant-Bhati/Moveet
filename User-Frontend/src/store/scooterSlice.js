import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as scooterApi from '../api/scooterApi';

export const fetchNearbyScooters = createAsyncThunk(
  'scooter/fetchNearby',
  async ({ lat, lng }, { rejectWithValue }) => {
    try {
      const response = await scooterApi.getNearbyScooters(lat, lng);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch nearby scooters');
    }
  }
);

export const fetchScooterById = createAsyncThunk(
  'scooter/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await scooterApi.getScooterById(id);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch scooter details');
    }
  }
);

const scooterSlice = createSlice({
  name: 'scooter',
  initialState: {
    nearbyScooters: [],
    selectedScooter: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setSelectedScooter: (state, action) => {
      state.selectedScooter = action.payload;
    },
    clearSelectedScooter: (state) => {
      state.selectedScooter = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchNearbyScooters
      .addCase(fetchNearbyScooters.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNearbyScooters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nearbyScooters = action.payload;
        state.error = null;
      })
      .addCase(fetchNearbyScooters.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })
      // fetchScooterById
      .addCase(fetchScooterById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchScooterById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedScooter = action.payload;
        state.error = null;
      })
      .addCase(fetchScooterById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { setSelectedScooter, clearSelectedScooter } = scooterSlice.actions;
export default scooterSlice.reducer;
